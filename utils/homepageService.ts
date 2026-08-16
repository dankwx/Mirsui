import 'server-only'
import { unstable_cache } from 'next/cache'
import { supabasePublic } from '@/utils/supabase/public'

/**
 * Dados públicos da landing.
 *
 * Antes, `getTrendingTracks` fazia 1 select + 3 counts por faixa — 25 idas ao
 * banco para montar 8 cards, em toda visita (a landing chama auth.getUser(),
 * então nunca cacheia). Hoje é 1 chamada à RPC `get_trending_tracks`, que faz
 * seleção, deduplicação e contagem numa varredura só.
 * Ver mirsui-backend/migrations/004_rpcs_de_contagem.sql.
 *
 * Dois dos três counts nem eram lidos: `likes_count` e `comments_count` eram
 * calculados e jogados fora — a landing só mostra o total de salvamentos.
 * Foram removidos junto com o `genre`, que era adivinhado a partir da
 * popularidade do Spotify e também não ia para tela nenhuma.
 */

/** A landing é a página mais visitada; 1 min de atraso nos cards não custa nada. */
const REVALIDAR_SEGUNDOS = 60

export interface TrendingTrack {
    id: number
    track_title: string
    artist_name: string
    album_name: string | null
    track_thumbnail: string | null
    track_url: string
    popularity: number
    claimedat: string
    /** quantas pessoas já salvaram esta faixa, no total */
    total_claims: number
    year: string
}

export interface RecentActivityItem {
    id: number
    track_title: string
    artist_name: string
    track_thumbnail: string | null
    position: number
    claimedat: string
    /** o que a pessoa escreveu ao salvar; quase sempre vazio, e tudo bem */
    claim_message: string | null
    /** spotify:track:<id> ou isrc:<ISRC> — chave opaca do acervo */
    track_uri: string | null
    /** identidade da gravação; é o que vira o link do ticker (migration 023) */
    isrc: string | null
    profiles: {
        username: string
        display_name: string | null
        avatar_url: string | null
    } | null
}

async function buscarTrending(limit: number): Promise<TrendingTrack[]> {
    const { data, error } = await supabasePublic.rpc('get_trending_tracks', {
        p_limit: limit,
    })

    if (error) {
        console.error('Erro ao buscar tracks trending:', error)
        return []
    }

    return (data ?? []).map((track: Omit<TrendingTrack, 'year'>) => ({
        ...track,
        // count(*) volta como bigint; o PostgREST serializa como número, mas a
        // garantia é barata e evita "[object Object]" na tela se isso mudar.
        total_claims: Number(track.total_claims) || 0,
        year: track.claimedat
            ? new Date(track.claimedat).getFullYear().toString()
            : '',
    }))
}

async function buscarAtividadeRecente(limit: number): Promise<RecentActivityItem[]> {
    const { data, error } = await supabasePublic
        .from('tracks')
        .select(
            `
      id,
      track_title,
      artist_name,
      track_thumbnail,
      position,
      claimedat,
      claim_message,
      track_uri,
      isrc,
      profiles:user_id!inner (
        username,
        display_name,
        avatar_url
      )
    `
        )
        .not('claimedat', 'is', null)
        .order('claimedat', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Erro ao buscar atividade recente:', error)
        return []
    }

    return (data ?? []) as unknown as RecentActivityItem[]
}

// unstable_cache inclui os argumentos na chave, então limites diferentes não se
// atropelam. A tag permite invalidar as duas de uma vez com revalidateTag.
const trendingCacheado = unstable_cache(buscarTrending, ['landing-trending'], {
    revalidate: REVALIDAR_SEGUNDOS,
    tags: ['landing'],
})

const atividadeCacheada = unstable_cache(
    buscarAtividadeRecente,
    ['landing-atividade'],
    { revalidate: REVALIDAR_SEGUNDOS, tags: ['landing'] }
)

export function getTrendingTracks(limit: number = 8): Promise<TrendingTrack[]> {
    return trendingCacheado(limit)
}

export function getRecentActivity(limit: number = 5): Promise<RecentActivityItem[]> {
    return atividadeCacheada(limit)
}
