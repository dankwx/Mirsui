// app/api/get-youtube-link/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { searchYouTubeVideo } from '@/utils/youtubeService'

export async function POST(request: NextRequest) {
    try {
        // Parse do body da requisição
        const body = await request.json()
        const { trackTitle, artistName } = body

        console.log('[API get-youtube-link] Recebida requisição para:', {
            trackTitle,
            artistName,
        })

        // Validação dos dados obrigatórios
        if (!trackTitle || !artistName) {
            console.log(
                '[API get-youtube-link] Dados inválidos - trackTitle ou artistName ausentes'
            )
            return NextResponse.json(
                { error: 'trackTitle e artistName são obrigatórios' },
                { status: 400 }
            )
        }

        // Busca no YouTube
        console.log('[API get-youtube-link] Iniciando busca no YouTube...')
        const youtubeUrl = await searchYouTubeVideo(trackTitle, artistName)
        console.log('[API get-youtube-link] Resultado da busca:', youtubeUrl)

        if (youtubeUrl) {
            console.log(
                '[API get-youtube-link] URL do YouTube encontrada:',
                youtubeUrl
            )
            return NextResponse.json({
                success: true,
                youtubeUrl: youtubeUrl,
            })
        } else {
            console.log(
                '[API get-youtube-link] Nenhuma URL do YouTube encontrada'
            )
            return NextResponse.json({
                success: false,
                message: 'Nenhuma URL do YouTube encontrada para esta música',
                youtubeUrl: null,
            })
        }
    } catch (error) {
        console.error('[API get-youtube-link] Erro na API:', error)
        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                details:
                    error instanceof Error
                        ? error.message
                        : 'Erro desconhecido',
            },
            { status: 500 }
        )
    }
}

// Método GET opcional para testes
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const trackTitle = searchParams.get('trackTitle')
    const artistName = searchParams.get('artistName')

    if (!trackTitle || !artistName) {
        return NextResponse.json(
            {
                error: 'trackTitle e artistName são obrigatórios como query params',
            },
            { status: 400 }
        )
    }

    try {
        console.log('[API get-youtube-link GET] Testando busca para:', {
            trackTitle,
            artistName,
        })
        const youtubeUrl = await searchYouTubeVideo(trackTitle, artistName)

        return NextResponse.json({
            success: !!youtubeUrl,
            youtubeUrl: youtubeUrl,
            query: `${trackTitle} ${artistName}`,
        })
    } catch (error) {
        console.error('[API get-youtube-link GET] Erro:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
