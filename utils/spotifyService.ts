import 'server-only'

interface SpotifyTokenResponse {
    access_token: string
    token_type: string
    expires_in: number
}

export interface SpotifyTrack {
    album: {
        name: string
        images: { url: string }[]
        release_date: string
    }
    artists: { name: string }[]
    name: string
    popularity: number
    uri: string
    duration_ms: number
    id: string
}

// Nova interface para os resultados de busca
export interface SpotifySearchResponse {
    tracks: {
        items: SpotifyTrack[]
        total: number
        limit: number
        offset: number
    }
    artists: {
        items: {
            id: string
            name: string
            images: { url: string }[]
            followers: { total: number }
            genres: string[]
        }[]
        total: number
        limit: number
        offset: number
    }
}

// Cache do token
let cachedSpotifyAccessToken: string | null = null
let cachedTokenExpiryTime: number | null = null

async function getSpotifyAccessToken(): Promise<string | null> {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        console.error(
            'Variáveis de ambiente SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET não definidas.'
        )
        return null
    }

    // Verifica se o token em cache existe e ainda é válido
    if (
        cachedSpotifyAccessToken &&
        cachedTokenExpiryTime &&
        Date.now() < cachedTokenExpiryTime
    ) {
        console.log('Usando token do Spotify em cache.')
        return cachedSpotifyAccessToken
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
            },
            body: 'grant_type=client_credentials',
            next: { revalidate: 3600 },
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(
                'Falha ao obter token do Spotify:',
                response.status,
                errorText
            )
            return null
        }

        const data: SpotifyTokenResponse = await response.json()
        cachedSpotifyAccessToken = data.access_token
        cachedTokenExpiryTime =
            Date.now() + data.expires_in * 1000 - 5 * 60 * 1000
        console.log('Novo token do Spotify obtido e cacheado.')
        return cachedSpotifyAccessToken
    } catch (error) {
        console.error('Erro ao buscar token do Spotify:', error)
        return null
    }
}

export async function fetchSpotifyTrackInfo(
    trackId: string
): Promise<SpotifyTrack | null> {
    const accessToken = await getSpotifyAccessToken()

    if (!accessToken) {
        console.error('Token do Spotify não disponível.')
        return null
    }

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/tracks/${trackId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                next: { revalidate: 86400 },
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error(
                `Falha ao buscar informações da faixa ${trackId}:`,
                response.status,
                errorText
            )
            if (
                response.status === 401 &&
                errorText.includes('The access token expired')
            ) {
                console.warn(
                    'Token do Spotify expirou. Forçando renovação na próxima requisição.'
                )
                cachedSpotifyAccessToken = null
                cachedTokenExpiryTime = null
            }
            return null
        }

        return await response.json()
    } catch (error) {
        console.error(`Erro ao buscar informações da faixa ${trackId}:`, error)
        return null
    }
}

// Nova função para buscar no Spotify
export async function searchSpotify(
    query: string,
    type: 'track' | 'artist' | 'album' = 'track',
    limit: number = 10
): Promise<SpotifySearchResponse | null> {
    const accessToken = await getSpotifyAccessToken()

    if (!accessToken) {
        console.error('Token do Spotify não disponível.')
        return null
    }

    if (!query.trim()) {
        return null
    }

    try {
        // Codifica a query para URL
        const encodedQuery = encodeURIComponent(query.trim())
        const searchTypes = type === 'track' ? 'track,artist' : type

        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodedQuery}&type=${searchTypes}&limit=${limit}&market=BR`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                next: { revalidate: 300 }, // Cache por 5 minutos para buscas
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error(
                `Falha ao buscar no Spotify para "${query}":`,
                response.status,
                errorText
            )

            if (response.status === 401) {
                console.warn('Token do Spotify expirou. Invalidando cache.')
                cachedSpotifyAccessToken = null
                cachedTokenExpiryTime = null
            }
            return null
        }

        return await response.json()
    } catch (error) {
        console.error(`Erro ao buscar no Spotify para "${query}":`, error)
        return null
    }
}
