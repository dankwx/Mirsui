// app/api/predictions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    console.log('🎯 API /api/predictions POST chamada')
    try {
        const requestData = await request.json()
        console.log('📥 Dados recebidos na API:', requestData)
        
        const { trackId, trackData, predictedViralDate, pointsBet, predictionConfidence, targetPopularity } = requestData

        // Validações básicas
        if (!trackId || !trackData || !predictedViralDate || !pointsBet || !predictionConfidence || !targetPopularity) {
            console.log('❌ Campos obrigatórios faltando:', { trackId: !!trackId, trackData: !!trackData, predictedViralDate: !!predictedViralDate, pointsBet: !!pointsBet, predictionConfidence: !!predictionConfidence, targetPopularity: !!targetPopularity })
            return NextResponse.json(
                { message: 'Todos os campos são obrigatórios' },
                { status: 400 }
            )
        }

        // Validar data
        const predictionDate = new Date(predictedViralDate)
        const today = new Date()
        const maxDate = new Date(today.getTime() + (365 * 24 * 60 * 60 * 1000)) // 1 ano

        if (predictionDate <= today) {
            return NextResponse.json(
                { message: 'A data da previsão deve ser no futuro' },
                { status: 400 }
            )
        }

        if (predictionDate > maxDate) {
            return NextResponse.json(
                { message: 'A data não pode ser mais de 1 ano no futuro' },
                { status: 400 }
            )
        }

        // Validar pontos
        if (pointsBet < 10 || pointsBet > 1000) {
            return NextResponse.json(
                { message: 'Pontos devem estar entre 10 e 1000' },
                { status: 400 }
            )
        }

        // Validar confiança
        if (predictionConfidence < 1 || predictionConfidence > 100) {
            return NextResponse.json(
                { message: 'Confiança deve estar entre 1% e 100%' },
                { status: 400 }
            )
        }

        // Validar popularidade alvo
        if (targetPopularity < 1 || targetPopularity > 100) {
            return NextResponse.json(
                { message: 'Popularidade alvo deve estar entre 1 e 100' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        console.log('🔐 Verificando autenticação...')
        // Verificar se o usuário está autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser()
        
        console.log('👤 Resultado da autenticação:', { 
            hasAuthData: !!authData, 
            hasUser: !!authData?.user, 
            authError: authError?.message,
            userId: authData?.user?.id 
        })
        
        if (authError || !authData?.user) {
            console.log('❌ Usuário não autenticado')
            return NextResponse.json(
                { message: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        const userId = authData.user.id
        console.log('✅ Usuário autenticado:', userId)

        // Verificar se a música já existe na tabela prediction_tracks
        let existingPredictionTrack = await supabase
            .from('prediction_tracks')
            .select('id')
            .eq('spotify_id', trackId)
            .single()

        let predictionTrackId: number

        if (existingPredictionTrack.data) {
            // Música já existe na tabela prediction_tracks
            predictionTrackId = existingPredictionTrack.data.id
        } else {
            // Criar nova entrada na tabela prediction_tracks
            const { data: newPredictionTrack, error: predictionTrackError } = await supabase
                .from('prediction_tracks')
                .insert({
                    spotify_id: trackId,
                    track_url: `https://open.spotify.com/track/${trackId}`,
                    track_title: trackData.track_title,
                    artist_name: trackData.artist_name,
                    album_name: trackData.album_name,
                    popularity: trackData.popularity,
                    track_thumbnail: trackData.track_thumbnail,
                    track_uri: trackData.track_uri
                })
                .select('id')
                .single()

            if (predictionTrackError) {
                console.error('Erro ao criar prediction track:', predictionTrackError)
                return NextResponse.json(
                    { message: 'Erro ao salvar música no banco de dados' },
                    { status: 500 }
                )
            }

            predictionTrackId = newPredictionTrack.id
        }

        // Verificar se já existe uma previsão para esta música pelo usuário
        const { data: existingPrediction } = await supabase
            .from('music_predictions')
            .select('id')
            .eq('user_id', userId)
            .eq('prediction_track_id', predictionTrackId)
            .single()

        if (existingPrediction) {
            return NextResponse.json(
                { message: 'Você já fez uma previsão para esta música' },
                { status: 400 }
            )
        }

        // Verificar se o usuário tem pontos suficientes
        const { data: userPoints } = await supabase
            .rpc('get_user_points', { user_uuid: userId })

        if (!userPoints || userPoints < pointsBet) {
            return NextResponse.json(
                { message: `Pontos insuficientes. Você tem ${userPoints || 0} pontos, mas precisa de ${pointsBet}.` },
                { status: 400 }
            )
        }

        // Criar a previsão
        const { data: prediction, error: predictionError } = await supabase
            .from('music_predictions')
            .insert({
                user_id: userId,
                prediction_track_id: predictionTrackId,
                predicted_viral_date: predictedViralDate,
                points_bet: pointsBet,
                prediction_confidence: predictionConfidence,
                target_popularity: targetPopularity,
                status: 'pending'
            })
            .select('*')
            .single()

        if (predictionError) {
            console.error('Erro ao criar previsão:', predictionError)
            return NextResponse.json(
                { message: 'Erro ao criar previsão' },
                { status: 500 }
            )
        }

        // Debitar pontos do usuário
        const { data: debitResult } = await supabase
            .rpc('debit_user_points', {
                user_uuid: userId,
                points_amount: pointsBet,
                transaction_description: `Previsão para "${trackData.track_title}" - ${trackData.artist_name}`,
                prediction_id: prediction.id
            })

        if (!debitResult) {
            // Se falhou o débito, deletar a previsão criada
            await supabase
                .from('music_predictions')
                .delete()
                .eq('id', prediction.id)

            return NextResponse.json(
                { message: 'Erro ao debitar pontos. Tente novamente.' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: 'Previsão criada com sucesso!',
            prediction
        })

    } catch (error) {
        console.error('Erro na API de previsões:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { message: 'ID do usuário é obrigatório' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Verificar se o usuário está autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authData?.user) {
            return NextResponse.json(
                { message: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        // Buscar previsões do usuário
        const { data: predictions, error } = await supabase
            .rpc('get_user_predictions', { user_uuid: userId })

        if (error) {
            console.error('Erro ao buscar previsões:', error)
            return NextResponse.json(
                { message: 'Erro ao buscar previsões' },
                { status: 500 }
            )
        }

        return NextResponse.json({ predictions: predictions || [] })

    } catch (error) {
        console.error('Erro na API de previsões GET:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}