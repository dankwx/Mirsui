// utils/artistClaims.ts
//
// O que é do Mirsui na página de artista: quem já salvou faixas dele.
//
// Uma consulta só, filtrando pelas gravações que a página já tem em mãos.
// As chaves seguem no corpo da RPC: até 99 ISRCs na URL do PostgREST faziam
// o proxy responder 502. Se a consulta falhar, a seção some.

import 'server-only'
import { supabasePublic } from '@/utils/supabase/public'
import type { FaixaDaVitrine } from '@/utils/artistPageService'

export interface SalvamentoDoArtista {
    user_id: string
    position: number | null
    claimedat: string | null
    /** a faixa salva, na forma da vitrine — para o texto "chegou primeiro em …" */
    faixa: FaixaDaVitrine
    profiles: unknown
}

export interface PrecedenciaDoArtista {
    /** salvamentos por `uri` da faixa (a mesma chave de `FaixaDaVitrine.uri`) */
    porFaixa: Record<string, number>
    /** as primeiras pessoas a salvar algo deste artista, sem repetir pessoa */
    primeiros: SalvamentoDoArtista[]
    /** total de salvamentos das faixas consultadas */
    total: number
    /** pessoas distintas */
    pessoas: number
}

interface LinhaDaTabela {
    user_id: string
    position: number | null
    claimedat: string | null
    isrc: string | null
    track_uri: string | null
    profiles: unknown
}

/** `isrc:BRXXX…` → `BRXXX…`; qualquer outra forma devolve null. */
function isrcDaUri(uri: string): string | null {
    return uri.startsWith('isrc:') ? uri.slice(5) : null
}

/**
 * Quem salvou as faixas dadas, com contagem por faixa e os primeiros a chegar.
 *
 * A mesma gravação pode estar guardada de duas formas (`tracks.isrc` para o
 * que foi salvo pela ficha nova; `track_uri` para o resto — ver
 * `filtroDaGravacao` em utils/trackClaims.ts). A RPC cobre as duas chaves.
 * Salvamentos antigos pelo id do Spotify sem ISRC preenchido ficam de fora:
 * a contagem pode ser menor que a real, nunca maior.
 */
export async function precedenciaDoArtista(
    faixas: FaixaDaVitrine[],
    limite = 8
): Promise<PrecedenciaDoArtista | null> {
    if (faixas.length === 0) return null

    const isrcs = Array.from(
        new Set(faixas.map((f) => isrcDaUri(f.uri)).filter(Boolean))
    ) as string[]
    const uris = Array.from(new Set(faixas.map((f) => f.uri)))

    if (isrcs.length === 0 && uris.length === 0) return null

    const { data, error } = await supabasePublic.rpc('get_artist_claims', {
        p_isrcs: isrcs,
        p_uris: uris,
        p_limite: 500,
    })

    if (error) {
        console.error('[artista] falha ao ler quem salvou:', error.message)
        return null
    }

    const linhas = (data ?? []) as unknown as LinhaDaTabela[]
    if (linhas.length === 0) {
        return { porFaixa: {}, primeiros: [], total: 0, pessoas: 0 }
    }

    // Índices para casar cada linha de volta à faixa da vitrine.
    const porIsrc = new Map<string, FaixaDaVitrine>()
    const porUri = new Map<string, FaixaDaVitrine>()
    for (const f of faixas) {
        porUri.set(f.uri, f)
        const isrc = isrcDaUri(f.uri)
        if (isrc) porIsrc.set(isrc, f)
    }

    const porFaixa: Record<string, number> = {}
    const primeiros: SalvamentoDoArtista[] = []
    const vistos = new Set<string>()

    for (const l of linhas) {
        const faixa =
            (l.isrc && porIsrc.get(l.isrc)) ||
            (l.track_uri && porUri.get(l.track_uri)) ||
            null
        if (!faixa) continue

        porFaixa[faixa.uri] = (porFaixa[faixa.uri] ?? 0) + 1
        vistos.add(l.user_id)

        // As linhas já vêm em ordem de chegada; a primeira de cada pessoa é a
        // que conta como "quando ela chegou a este artista".
        if (
            primeiros.length < limite &&
            !primeiros.some((p) => p.user_id === l.user_id)
        ) {
            primeiros.push({
                user_id: l.user_id,
                position: l.position,
                claimedat: l.claimedat,
                faixa,
                profiles: l.profiles,
            })
        }
    }

    return {
        porFaixa,
        primeiros,
        total: Object.values(porFaixa).reduce((s, n) => s + n, 0),
        pessoas: vistos.size,
    }
}
