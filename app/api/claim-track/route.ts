// app/api/claim-track/route.ts

import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const {
            trackUri,
            trackTitle,
            artistName,
            albumName,
            popularity,
            trackThumbnail,
            trackUrl,
            claimMessage,
        } = await request.json()

        // Validações básicas
        if (!trackUri || !trackTitle || !artistName) {
            return NextResponse.json(
                { error: 'Dados da música são obrigatórios' },
                { status: 400 }
            )
        }

        const supabase = createClient()

        // Verificar se o usuário está autenticado
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        // Verificar se o usuário já reivindicou esta música
        const { data: existingClaim, error: checkError } = await supabase
            .from('tracks')
            .select('id')
            .eq('user_id', user.id)
            .eq('track_uri', trackUri)
            .single()

        if (checkError && checkError.code !== 'PGRST116') {
            console.error(
                'Erro ao verificar reivindicação existente:',
                checkError
            )
            return NextResponse.json(
                { error: 'Erro interno do servidor' },
                { status: 500 }
            )
        }

        if (existingClaim) {
            return NextResponse.json(
                { error: 'Você já reivindicou esta música' },
                { status: 409 }
            )
        }

        // Buscar a próxima posição disponível para o usuário
        const { data: lastTrack, error: positionError } = await supabase
            .from('tracks')
            .select('position')
            .eq('user_id', user.id)
            .order('position', { ascending: false })
            .limit(1)
            .single()

        let nextPosition = 1
        if (!positionError && lastTrack) {
            nextPosition = lastTrack.position + 1
        }

        // Inserir a nova reivindicação
        const { data: newClaim, error: insertError } = await supabase
            .from('tracks')
            .insert({
                track_uri: trackUri,
                track_url: trackUrl,
                track_title: trackTitle,
                artist_name: artistName,
                album_name: albumName,
                popularity: popularity,
                track_thumbnail: trackThumbnail,
                user_id: user.id,
                position: nextPosition,
                claimedat: new Date().toISOString(),
                claim_message: claimMessage || null,
            })
            .select()
            .single()

        if (insertError) {
            console.error('Erro ao inserir reivindicação:', insertError)
            return NextResponse.json(
                { error: 'Erro ao processar reivindicação' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            claim: newClaim,
            message: 'Música reivindicada com sucesso!',
        })
    } catch (error) {
        console.error('Erro na API de reivindicação:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
