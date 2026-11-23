// utils/saltoService.ts
//
// O salto da semana: a faixa que a pessoa salvou e mais subiu nos últimos 7
// dias, se alguma subiu forte. A regra e os números estão na migration 050
// do backend (get_my_track_jump); aqui só se lê a linha.

import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface SaltoDaSemana {
    isrc: string
    title: string
    artistName: string
    /** audiência 0-100 sete dias atrás */
    antes: number
    /** audiência 0-100 na última medição */
    agora: number
    /** quando a pessoa salvou */
    salvaEm: string | null
    /** audiência no dia do save; null quando o Observatório ainda não media */
    salvaCom: number | null
}

interface Linha {
    isrc: string
    title: string
    artist_name: string
    antes: number
    agora: number
    salva_em: string | null
    salva_com: number | null
}

/**
 * Chame só com sessão: a função é de `authenticated` e responde pelo
 * `auth.uid()` do token. Falha vira null, porque o aviso é um extra do feed e
 * não pode derrubar a página.
 */
export async function getSaltoDaSemana(
    supabase: SupabaseClient
): Promise<SaltoDaSemana | null> {
    const { data, error } = await supabase.rpc('get_my_track_jump')
    if (error) {
        console.error('Erro ao buscar o salto da semana:', error.message)
        return null
    }

    const linha = (Array.isArray(data) ? data[0] : null) as Linha | null
    if (!linha?.isrc) return null

    return {
        isrc: linha.isrc,
        title: linha.title,
        artistName: linha.artist_name,
        antes: linha.antes,
        agora: linha.agora,
        salvaEm: linha.salva_em,
        salvaCom: linha.salva_com,
    }
}
