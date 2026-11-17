import 'server-only'
import { unstable_cache } from 'next/cache'
import { supabasePublic } from '@/utils/supabase/public'
import { enderecoDaFaixa } from '@/utils/trackHref'
import { enderecoDoArtista } from '@/utils/artistHref'

/**
 * O que entra no sitemap, e por quê só isto.
 *
 * O catálogo tem mais de 500 mil faixas ativas, e quase todas são uma ficha
 * gerada sem nenhum salvamento. Publicar tudo de uma vez é o jeito mais rápido
 * de o Google classificar o domínio como conteúdo automático de pouco valor
 * (docs/plano-de-urls-e-seo.md §10). Então o sitemap tem régua, e a régua
 * cresce aos poucos (docs/plano-de-seo.md §4):
 *
 *   1. toda faixa que alguém salvou — é o conteúdo que só o Mirsui tem;
 *   2. as faixas da banda `quente` (as que mudam de posição) mais populares,
 *      até `FAIXAS_QUENTES` — é onde a curva tem o que mostrar;
 *   3. os artistas dessas faixas que já têm ficha no banco;
 *   4. os perfis com pelo menos um salvamento.
 *
 * Duas regras que não são de gosto:
 *
 *   - Só entra o que está no banco. Faixa fora do catálogo e artista sem ficha
 *     chamam o Deezer na visita, e foi robô nessas páginas que estourou o
 *     gateway em outubro.
 *   - O endereço é montado com as MESMAS funções e os MESMOS campos que as
 *     rotas usam para o canônico (`observed_tracks.artist_name`/`title` e
 *     `artist_details.name`). Sitemap que aponta para um 308 é sitemap que o
 *     Google aprende a ignorar.
 */

/** Quantas faixas quentes entram. Aumentar é a alavanca da régua. */
const FAIXAS_QUENTES = 2000

/** O PostgREST devolve no máximo mil linhas por pedido. */
const PAGINA = 1000

/** Ids por pedido no `in`, para a URL não passar do que o nginx aceita. */
const LOTE = 200

export interface EntradaDoSitemap {
    caminho: string
    /** ISO 8601. Ausente quando não há uma data honesta para dar. */
    modificadoEm?: string
}

interface FaixaObservada {
    isrc: string
    title: string | null
    artist_name: string | null
    deezer_artist_id: string | null
    last_change_at: string | null
}

const CAMPOS_DA_FAIXA = 'isrc,title,artist_name,deezer_artist_id,last_change_at'

function emLotes<T>(itens: T[], tamanho: number): T[][] {
    const lotes: T[][] = []
    for (let i = 0; i < itens.length; i += tamanho) {
        lotes.push(itens.slice(i, i + tamanho))
    }
    return lotes
}

/** Erro de banco vira exceção: sitemap pela metade não pode ir para o cache. */
function exigir<T>(r: { data: T | null; error: { message: string } | null }): T {
    if (r.error) throw new Error(r.error.message)
    return r.data as T
}

async function montar(): Promise<EntradaDoSitemap[]> {
    /* ---- salvamentos: dão as faixas salvas e os donos dos perfis ---- */
    const salvamentos = exigir(
        await supabasePublic.from('tracks').select('user_id,isrc,claimedat')
    ) as { user_id: string; isrc: string | null; claimedat: string | null }[]

    const isrcsSalvos = Array.from(
        new Set(salvamentos.map((s) => s.isrc).filter((i): i is string => !!i))
    )
    const ultimoSavePorPessoa = new Map<string, string>()
    for (const s of salvamentos) {
        if (!s.claimedat) continue
        const atual = ultimoSavePorPessoa.get(s.user_id)
        if (!atual || s.claimedat > atual) {
            ultimoSavePorPessoa.set(s.user_id, s.claimedat)
        }
    }
    const pessoas = Array.from(new Set(salvamentos.map((s) => s.user_id)))

    /* ---- faixas ---- */
    const faixas = new Map<string, FaixaObservada>()

    for (const lote of emLotes(isrcsSalvos, LOTE)) {
        const linhas = exigir(
            await supabasePublic
                .from('observed_tracks')
                .select(CAMPOS_DA_FAIXA)
                .in('isrc', lote)
        ) as FaixaObservada[]
        for (const l of linhas) faixas.set(l.isrc, l)
    }

    for (let de = 0; de < FAIXAS_QUENTES; de += PAGINA) {
        const linhas = exigir(
            await supabasePublic
                .from('observed_tracks')
                .select(CAMPOS_DA_FAIXA)
                .eq('active', true)
                .eq('cadence_band', 'quente')
                .not('isrc', 'is', null)
                .order('last_popularity', { ascending: false })
                // Desempate fixo, para a paginação não repetir nem pular linha.
                .order('isrc', { ascending: true })
                .range(de, Math.min(de + PAGINA, FAIXAS_QUENTES) - 1)
        ) as FaixaObservada[]
        for (const l of linhas) if (!faixas.has(l.isrc)) faixas.set(l.isrc, l)
        if (linhas.length < PAGINA) break
    }

    /* ---- artistas dessas faixas, só os que têm ficha ---- */
    const idsDeArtista = Array.from(
        new Set(
            Array.from(faixas.values())
                .map((f) => f.deezer_artist_id)
                .filter((i): i is string => !!i)
        )
    )
    const artistas: { deezer_artist_id: string; name: string | null }[] = []
    for (const lote of emLotes(idsDeArtista, LOTE)) {
        artistas.push(
            ...(exigir(
                await supabasePublic
                    .from('artist_details')
                    .select('deezer_artist_id,name')
                    .in('deezer_artist_id', lote)
            ) as typeof artistas)
        )
    }

    /* ---- perfis com salvamento ---- */
    const perfis: { id: string; username: string | null }[] = []
    for (const lote of emLotes(pessoas, LOTE)) {
        perfis.push(
            ...(exigir(
                await supabasePublic
                    .from('profiles')
                    .select('id,username')
                    .in('id', lote)
                    .not('username', 'is', null)
            ) as typeof perfis)
        )
    }

    /* ---- as entradas ---- */
    const entradas: EntradaDoSitemap[] = []

    for (const f of Array.from(faixas.values())) {
        entradas.push({
            caminho: enderecoDaFaixa(f.isrc, f.artist_name, f.title),
            // A página muda quando a posição muda — é a data que o banco tem.
            modificadoEm: f.last_change_at ?? undefined,
        })
    }
    for (const a of artistas) {
        if (!a.name) continue
        entradas.push({ caminho: enderecoDoArtista(a.deezer_artist_id, a.name) })
    }
    for (const p of perfis) {
        if (!p.username) continue
        entradas.push({
            caminho: `/user/${encodeURIComponent(p.username)}`,
            modificadoEm: ultimoSavePorPessoa.get(p.id),
        })
    }

    return entradas
}

/**
 * Uma montagem por dia: são ~20 idas ao banco, e a régua não muda mais rápido
 * do que a rodada diária do Observatório. Exceção não é guardada pelo
 * `unstable_cache`, então uma falha de banco não vira sitemap vazio por 24 h.
 */
export const entradasDoSitemap = unstable_cache(montar, ['sitemap-v1'], {
    revalidate: 86400,
})
