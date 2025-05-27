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
    }
    artists: { name: string }[]
    name: string
    popularity: number
    uri: string
}

let spotifyAccessToken: string | null = null
let tokenExpiryTime: number | null = null

async function getSpotifyAccessToken(): Promise<string | null> {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        console.error(
            'Variáveis de ambiente SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET não definidas.'
        )
        return null
    }

    // Verifica se o token existe e ainda é válido
    if (spotifyAccessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
        return spotifyAccessToken
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            // Corrected URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
            },
            body: 'grant_type=client_credentials',
            // Cache o token por 1 hora (ou o tempo de expiração real do token)
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
        spotifyAccessToken = data.access_token
        // Define o tempo de expiração 5 minutos antes para garantir que o token não expire durante uma requisição
        tokenExpiryTime = Date.now() + data.expires_in * 1000 - 5 * 60 * 1000
        return spotifyAccessToken
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
            `https://api.spotify.com/v1/tracks/${trackId}`, // Corrected URL
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
            return null
        }

        return await response.json()
    } catch (error) {
        console.error(`Erro ao buscar informações da faixa ${trackId}:`, error)
        return null
    }
}
