// utils/youtubeService.ts

import 'server-only'

export interface YouTubeVideo {
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

export interface YouTubeSearchResponse {
    items: YouTubeVideo[]
    nextPageToken?: string
    pageInfo: {
        totalResults: number
        resultsPerPage: number
    }
}

/**
 * Busca uma música no YouTube usando a API do YouTube
 * @param trackName Nome da música
 * @param artistName Nome do artista
 * @param maxResults Número máximo de resultados (padrão: 5)
 * @returns Promise com o primeiro resultado encontrado ou null
 */
export async function searchYouTubeVideo(
    trackName: string,
    artistName: string,
    maxResults: number = 5
): Promise<string | null> {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    if (!apiKey) {
        console.error(
            '[youtubeService] YouTube API Key não encontrada nas variáveis de ambiente'
        )
        return null
    }

    // Limpa e formata a query de busca
    const query = `${trackName} ${artistName}`.trim()
    const encodedQuery = encodeURIComponent(query)
    console.log('[youtubeService] Iniciando busca no YouTube para:', query)

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodedQuery}&key=${apiKey}`,
            {
                next: { revalidate: 86400 }, // Cache por 24 horas
            }
        )
        console.log(
            '[youtubeService] Resposta da API YouTube:',
            response.status
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
        console.log('[youtubeService] Dados retornados da API YouTube:', data)
        if (!data.items || data.items.length === 0) {
            console.log(
                `[youtubeService] Nenhum resultado encontrado no YouTube para: ${query}`
            )
            return null
        }

        // Pega o primeiro resultado e retorna a URL completa do YouTube
        const firstVideo = data.items[0]
        const youtubeUrl = `https://www.youtube.com/watch?v=${firstVideo.id.videoId}`

        console.log(
            `[youtubeService] Música encontrada no YouTube: ${firstVideo.snippet.title} - ${youtubeUrl}`
        )
        return youtubeUrl
    } catch (error) {
        console.error(
            `[youtubeService] Erro ao buscar no YouTube para "${query}":`,
            error
        )
        return null
    }
}

/**
 * Busca múltiplos resultados no YouTube e retorna informações detalhadas
 * @param trackName Nome da música
 * @param artistName Nome do artista
 * @param maxResults Número máximo de resultados
 * @returns Promise com array de vídeos encontrados
 */
export async function searchYouTubeVideosDetailed(
    trackName: string,
    artistName: string,
    maxResults: number = 10
): Promise<YouTubeVideo[] | null> {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

    if (!apiKey) {
        console.error(
            '[youtubeService] YouTube API Key não encontrada nas variáveis de ambiente'
        )
        return null
    }

    const query = `${trackName} ${artistName}`.trim()
    const encodedQuery = encodeURIComponent(query)
    console.log(
        '[youtubeService] Iniciando busca detalhada no YouTube para:',
        query
    )

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodedQuery}&key=${apiKey}`,
            {
                next: { revalidate: 86400 },
            }
        )
        console.log(
            '[youtubeService] Resposta da API YouTube (detalhada):',
            response.status
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
        console.log(
            '[youtubeService] Dados detalhados retornados da API YouTube:',
            data
        )
        return data.items || []
    } catch (error) {
        console.error(
            `[youtubeService] Erro ao buscar no YouTube para "${query}":`,
            error
        )
        return null
    }
}
