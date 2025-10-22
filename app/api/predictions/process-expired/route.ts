// app/api/predictions/process-expired/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    try {
        console.log('🚀 API: process-expired chamada')
        const supabase = createClient()

        // Verificar se o usuário está autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authData?.user) {
            console.log('❌ API: Usuário não autenticado')
            return NextResponse.json(
                { message: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        console.log('✅ API: Usuário autenticado:', authData.user.id)

        // Executar função para processar previsões expiradas
        console.log('📊 API: Executando process_expired_predictions...')
        const { data: processedPredictions, error } = await supabase
            .rpc('process_expired_predictions')

        if (error) {
            console.error('❌ API: Erro ao processar previsões expiradas:', error)
            return NextResponse.json(
                { message: 'Erro ao processar previsões expiradas', error: error.message },
                { status: 500 }
            )
        }

        console.log('📊 API: Resultado da função:', processedPredictions)

        return NextResponse.json({
            message: 'Previsões processadas com sucesso',
            processed: processedPredictions || [],
            count: processedPredictions?.length || 0
        })

    } catch (error) {
        console.error('💥 API: Erro interno:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor', error: error instanceof Error ? error.message : 'Erro desconhecido' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient()

        // Verificar se o usuário está autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authData?.user) {
            return NextResponse.json(
                { message: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        // Buscar previsões expiradas (só para visualização)
        const { data: expiredPredictions, error } = await supabase
            .from('music_predictions')
            .select(`
                id,
                predicted_viral_date,
                status,
                tracks!inner (
                    track_title,
                    artist_name
                )
            `)
            .eq('status', 'pending')
            .lt('predicted_viral_date', new Date().toISOString())

        if (error) {
            console.error('Erro ao buscar previsões expiradas:', error)
            return NextResponse.json(
                { message: 'Erro ao buscar previsões expiradas' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            expired_predictions: expiredPredictions || [],
            count: expiredPredictions?.length || 0
        })

    } catch (error) {
        console.error('Erro na API de visualização:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}