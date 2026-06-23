// utils/spotifyService.ts

import 'server-only'

interface SpotifyTokenResponse {
    access_token: string
    token_type: string
    expires_in: number
}

export interface SpotifyTrack {
    album: {
        id: string
        name: string
        images: { url: string }[]
        release_date: string
        release_date_precision?: string
        total_tracks: number
    }
    artists: { name: string; id: number }[]
    name: string
    popularity: number
    uri: string
    duration_ms: number
    id: string
    explicit: boolean
    track_number: number
    external_ids?: { isrc?: string }
}

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

export interface SpotifyArtist {
    id: string
    name: string
    images: { url: string }[]
    followers: { total: number }
    genres: string[]
    popularity: number
    uri: string
    external_urls: {
        spotify: string
    }
}

export interface SpotifyAlbum {
    id: string
    name: string
    album_type: 'album' | 'single' | 'compilation'
    images: { url: string; height: number; width: number }[]
    release_date: string
    release_date_precision: string
    total_tracks: number
    external_urls: {
        spotify: string
    }
    artists: { name: string; id: string }[]
}

// Cache do token
let cachedSpotifyAccessToken: string | null = null
let cachedTokenExpiryTime: number | null = null

async function getSpotifyAccessToken(): Promise<string | null> {
    // Fallback para os nomes NEXT_PUBLIC_ antigos enquanto as variáveis
    // do ambiente de deploy não forem renomeadas
    const clientId =
        process.env.SPOTIFY_CLIENT_ID ||
        process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const clientSecret =
        process.env.SPOTIFY_CLIENT_SECRET ||
        process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        console.error(
            'Variáveis de ambiente SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET não definidas.'
        )
        return null
    }

    if (
        cachedSpotifyAccessToken &&
        cachedTokenExpiryTime &&
        Date.now() < cachedTokenExpiryTime
    ) {
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
        // Renova 5 minutos antes de expirar
        cachedTokenExpiryTime =
            Date.now() + data.expires_in * 1000 - 5 * 60 * 1000
        return cachedSpotifyAccessToken
    } catch (error) {
        console.error('Erro ao buscar token do Spotify:', error)
        return null
    }
}

/**
 * Faz uma requisição autenticada à API do Spotify, cuidando do token,
 * tratamento de erro e invalidação do cache em caso de 401.
 */
async function spotifyApiFetch<T>(
    path: string,
    revalidateSeconds: number
): Promise<T | null> {
    const accessToken = await getSpotifyAccessToken()

    if (!accessToken) {
        console.error('Token do Spotify não disponível.')
        return null
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1${path}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            next: { revalidate: revalidateSeconds },
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(
                `Falha na requisição ao Spotify (${path}):`,
                response.status,
                errorText
            )
            if (response.status === 401) {
                // Token expirou — força renovação na próxima requisição
                cachedSpotifyAccessToken = null
                cachedTokenExpiryTime = null
            }
            return null
        }

        return await response.json()
    } catch (error) {
        console.error(`Erro na requisição ao Spotify (${path}):`, error)
        return null
    }
}

export async function fetchSpotifyTrackInfo(
    trackId: string
): Promise<SpotifyTrack | null> {
    return spotifyApiFetch<SpotifyTrack>(`/tracks/${trackId}`, 86400)
}

export async function searchSpotify(
    query: string,
    type: string = 'track,artist',
    limit: number = 10
): Promise<SpotifySearchResponse | null> {
    if (!query.trim()) {
        return null
    }

    const encodedQuery = encodeURIComponent(query.trim())
    return spotifyApiFetch<SpotifySearchResponse>(
        `/search?q=${encodedQuery}&type=${type}&limit=${limit}&market=BR`,
        300
    )
}

export async function fetchSpotifyArtistInfo(
    artistId: string
): Promise<SpotifyArtist | null> {
    return spotifyApiFetch<SpotifyArtist>(`/artists/${artistId}`, 86400)
}

export async function fetchSpotifyArtistAlbums(
    artistId: string,
    includeGroups: string = 'album,single,compilation',
    limit: number = 50
): Promise<SpotifyAlbum[] | null> {
    const data = await spotifyApiFetch<{ items: SpotifyAlbum[] }>(
        `/artists/${artistId}/albums?include_groups=${includeGroups}&market=BR&limit=${limit}`,
        86400
    )
    return data ? data.items || [] : null
}

export async function fetchSpotifyArtistTopTracks(
    artistId: string
): Promise<SpotifyTrack[] | null> {
    const data = await spotifyApiFetch<{ tracks: SpotifyTrack[] }>(
        `/artists/${artistId}/top-tracks?market=BR`,
        86400
    )
    return data ? data.tracks || [] : null
}
