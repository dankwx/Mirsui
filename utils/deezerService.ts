// utils/deezerService.ts
//
// O Spotify expõe gênero apenas no objeto do artista, e esse array vem vazio
// para a maioria dos artistas BR/indie. O Deezer cataloga gênero no álbum e
// costuma cobrir rap/hip-hop nacional, então usamos a API pública (sem auth)
// como fallback, mapeando a faixa pelo ISRC.

import 'server-only'

interface DeezerTrack {
    album?: { id?: number }
    error?: unknown
}

interface DeezerAlbum {
    genres?: { data?: { name: string }[] }
    error?: unknown
}

async function deezerFetch<T>(path: string): Promise<T | null> {
    try {
        const res = await fetch(`https://api.deezer.com${path}`, {
            // Cache longo: gênero de álbum não muda
            next: { revalidate: 86400 },
        })
        if (!res.ok) return null
        const data = (await res.json()) as T & { error?: unknown }
        if (data && data.error) return null
        return data
    } catch {
        return null
    }
}

/**
 * Retorna os gêneros do álbum da faixa identificada pelo ISRC, ou null.
 * Ex.: "Rap/Hip Hop".
 */
export async function fetchDeezerGenresByISRC(
    isrc: string
): Promise<string[] | null> {
    if (!isrc) return null

    const track = await deezerFetch<DeezerTrack>(`/track/isrc:${isrc}`)
    const albumId = track?.album?.id
    if (!albumId) return null

    const album = await deezerFetch<DeezerAlbum>(`/album/${albumId}`)
    const names = album?.genres?.data?.map((g) => g.name).filter(Boolean)
    return names && names.length > 0 ? names : null
}
