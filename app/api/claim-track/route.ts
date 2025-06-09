// app/api/claim-track/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { fetchAuthData } from '@/utils/profileService'
import {
    saveTrackWithYouTube,
    checkUserTrackClaim,
} from '@/utils/fetchTrackInfo'

export async function POST(request: NextRequest) {
    try {
        // Verifica autenticação
        const authData = await fetchAuthData()
        if (!authData?.user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        // Parse do body da requisição
        const body = await request.json()
        const {
            trackUri,
            trackName,
            artistName,
            albumName,
            spotifyUrl,
            trackThumbnail,
            popularity,
            duration_ms,
        } = body

        // Validação dos dados obrigatórios
        if (!trackUri || !trackName || !artistName) {
            return NextResponse.json(
                { error: 'Dados da música são obrigatórios' },
                { status: 400 }
            )
        }

        // Verifica se o usuário já reivindicou esta música
        console.log('[API] Verificando se o usuário já reivindicou a música:', { userId: authData.user.id, trackUri })
        const existingClaim = await checkUserTrackClaim(
            authData.user.id,
            trackUri
        )
        console.log('[API] Resultado da verificação de reivindicação:', existingClaim)

        if (existingClaim?.claimed) {
            console.log('[API] Usuário já reivindicou esta música, retornando 409', existingClaim)
            return NextResponse.json(
                {
                    error: 'Você já reivindicou esta música',
                    position: existingClaim.position,
                    youtubeUrl: existingClaim.youtubeUrl,
                },
                { status: 409 }
            )
        }

        // Gera posição aleatória (você pode implementar sua lógica aqui)
        const position = Math.floor(Math.random() * 100) + 1
        console.log('[API] Posição gerada para a música:', position)

        // Prepara dados para salvar
        const trackData = {
            trackUri,
            trackName,
            artistName,
            albumName,
            spotifyUrl,
            trackThumbnail,
            popularity: popularity || 0,
            duration_ms: duration_ms || 0,
            userId: authData.user.id,
            position,
        }
        console.log('[API] Dados preparados para salvar:', trackData)

        // Salva a música com busca automática no YouTube
        const result = await saveTrackWithYouTube(trackData)
        console.log('[API] Resultado da função saveTrackWithYouTube:', result)

        if (!result.success) {
            console.log('[API] Erro ao salvar música:', result.error)
            return NextResponse.json(
                { error: result.error || 'Erro ao salvar música' },
                { status: 500 }
            )
        }

        // Retorna sucesso com informações
        console.log('[API] Música reivindicada com sucesso! Retornando dados:', {
            position: position,
            youtubeUrl: result.data?.youtube_url,
            data: result.data,
        })
        return NextResponse.json({
            success: true,
            message: 'Música reivindicada com sucesso!',
            position: position,
            youtubeUrl: result.data?.youtube_url,
            data: result.data,
        })
    } catch (error) {
        console.error('Erro na API claim-track:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// Opcional: GET para verificar status de reivindicação
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const trackUri = searchParams.get('trackUri')

        if (!trackUri) {
            return NextResponse.json(
                { error: 'trackUri é obrigatório' },
                { status: 400 }
            )
        }

        const authData = await fetchAuthData()
        if (!authData?.user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        const claimStatus = await checkUserTrackClaim(
            authData.user.id,
            trackUri
        )

        return NextResponse.json({
            claimed: claimStatus?.claimed || false,
            position: claimStatus?.position,
            youtubeUrl: claimStatus?.youtubeUrl,
        })
    } catch (error) {
        console.error('Erro ao verificar reivindicação:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
