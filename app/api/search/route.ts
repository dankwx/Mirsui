import { NextRequest, NextResponse } from 'next/server'
import { searchSpotify } from '@/utils/spotifyService'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')
        const type =
            (searchParams.get('type') as 'track' | 'artist' | 'album') ||
            'track'
        const limit = parseInt(searchParams.get('limit') || '10')

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: 'Query de busca é obrigatória' },
                { status: 400 }
            )
        }

        // Evita buscas muito curtas que podem retornar muitos resultados irrelevantes
        if (query.trim().length < 2) {
            return NextResponse.json(
                { error: 'Query deve ter pelo menos 2 caracteres' },
                { status: 400 }
            )
        }

        const searchResults = await searchSpotify(query, type, limit)

        if (!searchResults) {
            return NextResponse.json(
                { error: 'Erro ao buscar no Spotify' },
                { status: 500 }
            )
        }

        return NextResponse.json(searchResults)
    } catch (error) {
        console.error('Erro na rota de busca:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
