import 'server-only'
import { unstable_cache } from 'next/cache'
import { supabasePublic } from '@/utils/supabase/public'

/**
 * Dados públicos da landing.
 *
 * Já morou aqui `getTrendingTracks`, que servia os cards de "trending" da home
 * antiga via RPC `get_trending_tracks` (migration 004). A home foi refeita e
 * nenhuma seção chama mais — saiu junto com a última página que a usava. A RPC
 * segue no banco; se ninguém a chamar até a próxima faxina de migrations, é
 * candidata a cair também.
 */

/** A landing é a página mais visitada; 1 min de atraso nos cards não custa nada. */
const REVALIDAR_SEGUNDOS = 60

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
// atropelam. A tag permite invalidar com revalidateTag.
const atividadeCacheada = unstable_cache(
    buscarAtividadeRecente,
    ['landing-atividade'],
    { revalidate: REVALIDAR_SEGUNDOS, tags: ['landing'] }
)

export function getRecentActivity(limit: number = 5): Promise<RecentActivityItem[]> {
    return atividadeCacheada(limit)
}
