import { NextRequest, NextResponse } from 'next/server'
import { fetchSpotifyTrackInfo } from '@/utils/spotifyService'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const trackId = params.id

        if (!trackId) {
            return NextResponse.json(
                { error: 'Track ID é obrigatório' },
                { status: 400 }
            )
        }

        console.log(
            `[API] Buscando informações do Spotify para track ID: ${trackId}`
        )

        const trackInfo = await fetchSpotifyTrackInfo(trackId)

        if (!trackInfo) {
            return NextResponse.json(
                { error: 'Música não encontrada no Spotify' },
                { status: 404 }
            )
        }

        console.log(`[API] Informações do Spotify obtidas com sucesso`)

        return NextResponse.json(trackInfo)
    } catch (error) {
        console.error('[API] Erro ao buscar informações do Spotify:', error)

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
