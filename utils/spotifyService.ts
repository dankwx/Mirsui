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
}

// Em vez de variáveis globais simples, vamos usar um cache de módulo (singleton no servidor)
// para simular um cache persistente para o token dentro de uma única instância do servidor.
// No entanto, para ambientes serverless, você precisará de uma estratégia diferente (veja ponto 2).
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
            // <<-- CORRIGIDO AQUI
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
            },
            body: 'grant_type=client_credentials',
            // O cache do Next.js para a requisição de token pode ser útil,
            // mas o mais importante é o controle do token em si.
            next: { revalidate: 3600 }, // Cache a resposta da requisição por 1 hora
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
        // Define o tempo de expiração 5 minutos antes da expiração real
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
            `https://api.spotify.com/v1/tracks/${trackId}`, // <<-- CORRIGIDO AQUI
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                // O cache do Next.js para as informações da faixa pode ser bem longo,
                // já que as informações da faixa raramente mudam.
                next: { revalidate: 86400 }, // Cache por 24 horas (exemplo)
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error(
                `Falha ao buscar informações da faixa ${trackId}:`,
                response.status,
                errorText
            )
            // Se o token expirou, forçamos a busca de um novo token na próxima tentativa
            if (
                response.status === 401 &&
                errorText.includes('The access token expired')
            ) {
                console.warn(
                    'Token do Spotify expirou. Forçando renovação na próxima requisição.'
                )
                cachedSpotifyAccessToken = null // Invalida o token para forçar a renovação
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
