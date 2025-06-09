import { NextRequest, NextResponse } from 'next/server'
import { searchYouTubeVideo } from '@/utils/youtubeService'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { trackName, artistName } = body

        if (!trackName || !artistName) {
            return NextResponse.json(
                { error: 'trackName e artistName são obrigatórios' },
                { status: 400 }
            )
        }

        console.log(`[API] Buscando no YouTube: ${trackName} - ${artistName}`)

        const youtubeUrl = await searchYouTubeVideo(trackName, artistName)

        if (!youtubeUrl) {
            return NextResponse.json(
                {
                    error: 'Vídeo não encontrado no YouTube',
                    url: null,
                },
                { status: 404 }
            )
        }

        console.log(`[API] Vídeo do YouTube encontrado: ${youtubeUrl}`)

        return NextResponse.json({ url: youtubeUrl })
    } catch (error) {
        console.error('[API] Erro ao buscar no YouTube:', error)

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
