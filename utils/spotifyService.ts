// utils/spotifyService.ts
//
// O que sobrou do Spotify no front, e por quê.
//
// Este arquivo era a espinha do site: a página de faixa, a de artista e a busca
// saíam toda daqui. Em 15/08/2026 a credencial do projeto respondia:
//
//   429 (Retry-After 12205s)  /tracks/{id}, /artists/{id}, /search,
//                             /artists/{id}/albums
//   403                       /artists/{id}/top-tracks, /audio-features/{id}
//   404                       /recommendations   (removido pela plataforma)
//
// Os 403 e o 404 atravessaram a janela de castigo — não são consequência do
// 429. E as páginas de faixa em produção renderizavam "Faixa Desconhecida",
// porque tudo nelas era derivado de uma chamada só.
//
// Hoje a fonte é o Deezer (utils/deezerService.ts): uma requisição sem chave,
// sem token e sem `market=` devolve tudo que a página lê, mais o gênero — que o
// Spotify deixa vazio para BR e indie — e a prévia de 30 s, que o Spotify
// cortou. Ver docs/plano-independencia-do-spotify.md.
//
// SOBRARAM TRÊS FUNÇÕES, TODAS FORA DO CAMINHO CRÍTICO:
//
//   fetchSpotifyTrackInfo   último recurso de utils/trackIdentity.ts para
//                           descobrir o ISRC de um id do Spotify que não veio
//                           de lugar nenhum nosso — só para redirecionar
//   fetchSpotifyArtistInfo  o nome de um artista, para converter URL antiga de
//                           /artist/<idDoSpotify> em id do Deezer
//   searchSpotify           a reserva da busca, quando o Deezer não acha nada
//
// As três são chamadas por `await import(...)`, e nenhuma roda sem credencial.
// O teste de aceitação do plano é subir o site com SPOTIFY_CLIENT_ID e
// SPOTIFY_CLIENT_SECRET vazios e não notar diferença nenhuma, exceto que o
// botão "ouvir no Spotify" às vezes cai na busca em vez da faixa exata.
//
// O QUE SAIU: fetchSpotifyArtistAlbums e fetchSpotifyArtistTopTracks. O
// primeiro virou /artist/{id}/albums do Deezer; o segundo respondia 403 —
// aquela seção do site estava quebrada, calada, havia meses.

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

    // Antes isto era console.error. Virou silêncio de propósito: as envs do
    // Spotify passaram a ser OPCIONAIS, e um log de erro a cada visita de
    // página treinaria qualquer um a ignorar os logs do serviço.
    if (!clientId || !clientSecret) return null

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
 *
 * Devolver null aqui deixou de ser catastrófico: nenhuma tela é montada a
 * partir desta função. Ela ou consegue enriquecer um link, ou não.
 */
async function spotifyApiFetch<T>(
    path: string,
    revalidateSeconds: number
): Promise<T | null> {
    const accessToken = await getSpotifyAccessToken()
    if (!accessToken) return null

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

/**
 * Só para descobrir o ISRC de um id do Spotify que não resolveu localmente e
 * então redirecionar (utils/trackIdentity.ts, degrau 3). O resto da ficha vem
 * do Deezer.
 */
export async function fetchSpotifyTrackInfo(
    trackId: string
): Promise<SpotifyTrack | null> {
    return spotifyApiFetch<SpotifyTrack>(`/tracks/${trackId}`, 86400)
}

/** A reserva da busca, quando o Deezer não devolve nada (app/api/search). */
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

/**
 * Só para pegar o NOME e converter uma URL antiga de /artist/<idDoSpotify> no
 * id do Deezer, que é como a página de artista passou a ser endereçada.
 */
export async function fetchSpotifyArtistInfo(
    artistId: string
): Promise<SpotifyArtist | null> {
    return spotifyApiFetch<SpotifyArtist>(`/artists/${artistId}`, 86400)
}
