// utils/trackIdentity.ts
//
// Quem é o dono do endereço /track/[id].
//
// O identificador canônico do site passou a ser o ISRC — o código da GRAVAÇÃO,
// emitido pela indústria, que não pertence a plataforma nenhuma. Ver
// docs/plano-independencia-do-spotify.md §4.
//
// A rota continua aceitando os dois formatos antigos, e eles não colidem:
//
//   ISRC     ^[A-Z]{2}[A-Z0-9]{3}\d{7}$   12 chars   USUM72409273
//   Spotify  ^[A-Za-z0-9]{22}$            22 chars   2plbrEY59IikOBgBGLjaoe
//   Deezer   ^\d+$                        só dígitos 2947516331
//
// Verificado contra os 3.425 ISRCs reais do banco em 15/08/2026: 3.425 casam o
// primeiro padrão, 0 casam o do Spotify, 0 casam o do Deezer. Ou seja, link
// mandado no WhatsApp há três meses continua abrindo — por 301, não por 404.

import 'server-only'
import { unstable_cache } from 'next/cache'
import { supabasePublic } from '@/utils/supabase/public'
import { searchDeezerTracks, fetchDeezerTrackById } from '@/utils/deezerService'

export const ISRC_RE = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/
export const SPOTIFY_ID_RE = /^[A-Za-z0-9]{22}$/
export const DEEZER_ID_RE = /^\d+$/

export type FormatoDeId = 'isrc' | 'spotify' | 'deezer' | 'desconhecido'

/**
 * Em que formato veio o id da URL.
 *
 * A ordem importa: um ISRC tem 12 caracteres e um id do Spotify tem 22, então
 * testar ISRC primeiro nunca rouba um id do Spotify. Só dígitos é do Deezer.
 */
export function formatoDoId(bruto: string): FormatoDeId {
    const id = (bruto || '').trim()
    if (ISRC_RE.test(id.toUpperCase()) && id.length === 12) return 'isrc'
    if (DEEZER_ID_RE.test(id)) return 'deezer'
    if (SPOTIFY_ID_RE.test(id)) return 'spotify'
    return 'desconhecido'
}

/** O endereço canônico de uma gravação. */
export function hrefDaFaixa(isrc: string | null | undefined): string | null {
    return isrc ? `/track/${isrc.toUpperCase()}` : null
}

/* --------------------------------------------------- o que já é nosso (SQL) */

export interface FaixaObservada {
    deezerTrackId: string
    deezerArtistId: string | null
    isrc: string
    title: string
    artistName: string
    albumName: string | null
    coverMd5: string | null
    genre: string | null
    spotifyTrackId: string | null
    lastRank: number | null
    lastPopularity: number | null
}

const COLUNAS =
    'deezer_track_id, deezer_artist_id, isrc, title, artist_name, album_name, cover_md5, genre, spotify_track_id, last_rank, last_popularity'

interface LinhaObservada {
    deezer_track_id: string
    deezer_artist_id: string | null
    isrc: string | null
    title: string | null
    artist_name: string | null
    album_name: string | null
    cover_md5: string | null
    genre: string | null
    spotify_track_id: string | null
    last_rank: number | null
    last_popularity: number | null
}

function montar(r: LinhaObservada | null | undefined): FaixaObservada | null {
    if (!r?.isrc || !r.title || !r.artist_name) return null
    return {
        deezerTrackId: r.deezer_track_id,
        deezerArtistId: r.deezer_artist_id,
        isrc: r.isrc,
        title: r.title,
        artistName: r.artist_name,
        albumName: r.album_name,
        coverMd5: r.cover_md5,
        genre: r.genre,
        spotifyTrackId: r.spotify_track_id,
        lastRank: r.last_rank,
        lastPopularity: r.last_popularity,
    }
}

/**
 * A linha do Observatório para uma gravação — título, artista, capa e rank, sem
 * chamada nenhuma para fora.
 *
 * É este dado que garante que a página não vá a branco: se o Deezer estiver
 * fora do ar ou em quota, ela ainda tem o essencial, porque isto foi medido por
 * nós e está em casa.
 *
 * O desempate por `last_rank desc` é o mesmo da migration 011: o Deezer mantém
 * mais de um id para a mesma gravação (single e faixa de álbum), e o id de
 * maior rank é o que as pessoas tocam.
 */
export const buscarFaixaObservada = unstable_cache(
    async (isrc: string): Promise<FaixaObservada | null> => {
        const { data, error } = await supabasePublic
            .from('observed_tracks')
            .select(COLUNAS)
            .eq('isrc', isrc)
            .eq('active', true)
            .order('last_rank', { ascending: false, nullsFirst: false })
            .limit(1)
            .maybeSingle()

        if (error) {
            console.error('[identidade] falha ao ler observed_tracks:', error.message)
            return null
        }
        return montar(data as LinhaObservada | null)
    },
    ['faixa-observada'],
    { revalidate: 3600, tags: ['observatorio'] }
)

/* ------------------------------------------------------- id antigo -> ISRC */

/**
 * O último recurso do degrau 3. Import dinâmico de propósito: sem credencial do
 * Spotify o módulo nem é carregado, e nada no caminho de render depende dele.
 */
async function isrcPelaApiDoSpotify(spotifyId: string): Promise<string | null> {
    const temCredencial =
        !!(process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID) &&
        !!(process.env.SPOTIFY_CLIENT_SECRET || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET)
    if (!temCredencial) return null

    try {
        const { fetchSpotifyTrackInfo } = await import('@/utils/spotifyService')
        const faixa = await fetchSpotifyTrackInfo(spotifyId)
        return faixa?.external_ids?.isrc ?? null
    } catch {
        return null
    }
}

/**
 * ISRC a partir de um id do Spotify, em três degraus — nenhum deles chama a API
 * do Spotify no caminho feliz:
 *
 *   1. `observed_tracks.spotify_track_id`: a ponte que o job já pagou (1.388
 *      faixas). Consulta local, custo zero.
 *   2. `tracks.track_uri`: faixa que alguém salvou mas que o Observatório nunca
 *      viu. O acervo guarda título e artista, e o Deezer casa por texto.
 *   3. a própria API do Spotify, só para descobrir o ISRC e sair do formato
 *      dele. Último recurso, para id que não veio de lugar nenhum nosso — e o
 *      único ponto do fluxo em que o Spotify ainda aparece. Sem credencial ele
 *      simplesmente não roda, e é por isso que o teste de aceitação do plano
 *      (subir o site com as envs vazias) continua passando.
 */
export const isrcDeIdSpotify = unstable_cache(
    async (spotifyId: string): Promise<string | null> => {
        const { data } = await supabasePublic
            .from('observed_tracks')
            .select('isrc')
            .eq('spotify_track_id', spotifyId)
            .not('isrc', 'is', null)
            .order('last_rank', { ascending: false, nullsFirst: false })
            .limit(1)
            .maybeSingle()

        if (data?.isrc) return data.isrc as string

        // Degrau 2: o acervo do site. Uma faixa salva por alguém tem título e
        // artista gravados, e é tudo que a busca do Deezer precisa.
        const { data: salva } = await supabasePublic
            .from('tracks')
            .select('track_title, artist_name')
            .eq('track_uri', `spotify:track:${spotifyId}`)
            .limit(1)
            .maybeSingle()

        const titulo = (salva as { track_title?: string } | null)?.track_title
        const artista = (salva as { artist_name?: string } | null)?.artist_name

        if (titulo && artista) {
            const achadas = await searchDeezerTracks(`${artista} ${titulo}`, 1)
            if (achadas[0]?.isrc) return achadas[0].isrc
        }

        // Degrau 3. Não é `fetchSpotifyTrackInfo` renderizando a página: é uma
        // consulta para pegar o ISRC e redirecionar de vez para a forma
        // canônica, depois da qual esta URL nunca mais precisa do Spotify.
        return isrcPelaApiDoSpotify(spotifyId)
    },
    ['isrc-de-spotify'],
    { revalidate: 86400, tags: ['observatorio'] }
)

/** ISRC a partir de um id do Deezer: local primeiro, Deezer depois. */
export const isrcDeIdDeezer = unstable_cache(
    async (deezerId: string): Promise<string | null> => {
        const { data } = await supabasePublic
            .from('observed_tracks')
            .select('isrc')
            .eq('deezer_track_id', deezerId)
            .not('isrc', 'is', null)
            .limit(1)
            .maybeSingle()

        if (data?.isrc) return data.isrc as string

        const faixa = await fetchDeezerTrackById(deezerId)
        return faixa?.isrc ?? null
    },
    ['isrc-de-deezer'],
    { revalidate: 86400, tags: ['observatorio'] }
)
