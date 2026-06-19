// utils/youtubeService.ts

import 'server-only'

interface YouTubeVideo {
    id: {
        videoId: string
    }
    snippet: {
        title: string
        description: string
        thumbnails: {
            default: { url: string }
            medium: { url: string }
            high: { url: string }
        }
        channelTitle: string
        publishedAt: string
    }
}

interface YouTubeSearchResponse {
    items: YouTubeVideo[]
    nextPageToken?: string
    pageInfo: {
        totalResults: number
        resultsPerPage: number
    }
}

async function searchYouTube(
    trackName: string,
    artistName: string,
    maxResults: number
): Promise<YouTubeVideo[] | null> {
    // Fallback para o nome NEXT_PUBLIC_ antigo enquanto a variável
    // do ambiente de deploy não for renomeada
    const apiKey =
        process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

    if (!apiKey) {
        console.error(
            '[youtubeService] YouTube API Key não encontrada nas variáveis de ambiente'
        )
        return null
    }

    const query = `${trackName} ${artistName}`.trim()
    const encodedQuery = encodeURIComponent(query)

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodedQuery}&key=${apiKey}`,
            {
                next: { revalidate: 86400 }, // Cache por 24 horas
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error(
                `[youtubeService] Falha ao buscar no YouTube para "${query}":`,
                response.status,
                errorText
            )
            return null
        }

        const data: YouTubeSearchResponse = await response.json()
        return data.items || []
    } catch (error) {
        console.error(
            `[youtubeService] Erro ao buscar no YouTube para "${query}":`,
            error
        )
        return null
    }
}

/**
 * Busca uma música no YouTube e retorna a URL do primeiro resultado, ou null.
 */
export async function searchYouTubeVideo(
    trackName: string,
    artistName: string,
    maxResults: number = 5
): Promise<string | null> {
    const videos = await searchYouTube(trackName, artistName, maxResults)

    if (!videos || videos.length === 0) {
        return null
    }

    return `https://www.youtube.com/watch?v=${videos[0].id.videoId}`
}
