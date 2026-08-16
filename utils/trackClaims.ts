// utils/trackClaims.ts
//
// Quem salvou uma GRAVAÇÃO — e não "quem salvou uma linha com esta string".
//
// `tracks.track_uri` é, e continua sendo, uma chave opaca: as 46 linhas do
// acervo real guardam `spotify:track:<id>` e migrar isso seria risco alto no
// único dado insubstituível do produto (ver plano-independencia-do-spotify §7).
// O que mudou é que agora existe `tracks.isrc` ao lado, preenchida no momento
// do save e retroativamente para tudo que a ponte do Observatório conhecia.
//
// Com as duas colunas, a contagem passa a ser por gravação: a mesma faixa
// salva por um caminho antigo (uri do Spotify) e por um caminho novo
// (`isrc:<ISRC>`) conta junto, em vez de virar dois contadores paralelos.

import 'server-only'
import { createClient } from '@/utils/supabase/server'

/**
 * O filtro que identifica uma gravação nas duas formas. O ISRC é [A-Z0-9]{12} e
 * as duas formas de uri não têm vírgula, então nada aqui precisa de escape para
 * a sintaxe do `.or()` do PostgREST.
 */
export function filtroDaGravacao(
    trackUri: string | null,
    isrc: string | null
): string | null {
    const partes: string[] = []
    if (isrc) partes.push(`isrc.eq.${isrc}`)
    if (trackUri) partes.push(`track_uri.eq.${trackUri}`)
    return partes.length > 0 ? partes.join(',') : null
}

/** Quantas pessoas salvaram esta gravação. */
export async function contarSalvamentos(
    trackUri: string | null,
    isrc: string | null
): Promise<number> {
    const filtro = filtroDaGravacao(trackUri, isrc)
    if (!filtro) return 0

    const supabase = await createClient()
    const { count, error } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .or(filtro)

    if (error) {
        console.error('[acervo] falha ao contar salvamentos:', error.message)
        return 0
    }
    return count || 0
}

export interface QuemSalvou {
    user_id: string
    position: number | null
    claimedat: string | null
    profiles: unknown
}

/** Os primeiros a salvar, em ordem de chegada. */
export async function quemSalvou(
    trackUri: string | null,
    isrc: string | null,
    limite = 8
): Promise<QuemSalvou[]> {
    const filtro = filtroDaGravacao(trackUri, isrc)
    if (!filtro) return []

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tracks')
        .select(
            'user_id, position, claimedat, profiles:user_id ( username, avatar_url, display_name )'
        )
        .or(filtro)
        .order('position', { ascending: true })
        .limit(limite)

    if (error) {
        console.error('[acervo] falha ao listar quem salvou:', error.message)
        return []
    }
    return (data || []) as unknown as QuemSalvou[]
}

/** O salvamento do próprio usuário, se existir. */
export async function salvamentoDoUsuario(
    userId: string,
    trackUri: string | null,
    isrc: string | null
): Promise<{ position: number | null } | null> {
    const filtro = filtroDaGravacao(trackUri, isrc)
    if (!filtro) return null

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tracks')
        .select('position')
        .eq('user_id', userId)
        .or(filtro)
        .limit(1)
        .maybeSingle()

    if (error || !data) return null
    return { position: (data as { position: number | null }).position }
}
