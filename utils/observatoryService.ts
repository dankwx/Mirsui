import 'server-only'
import { unstable_cache } from 'next/cache'
import { supabasePublic } from '@/utils/supabase/public'

/**
 * Leitura do Observatório — a série de audiência que o backend mede todo dia.
 *
 * O Observatório (mirsui-backend/src/jobs/catalogSnapshot.ts) mede milhares de
 * faixas por noite no Deezer e guarda um ponto por faixa por dia. Isso não
 * depende de ninguém ter salvado a faixa: a maioria das faixas medidas nunca
 * passou pelo site.
 *
 * O dado é próprio e não tem como ser refeito depois: nenhuma API devolve "qual
 * era o rank em março". Ou foi medido naquele dia, ou aquele ponto não existe.
 *
 * A ponte com a página é o ISRC, que a resposta do Spotify já traz em
 * `external_ids.isrc` — ver migrations/011_curva_da_faixa.sql para o porquê da
 * escolha do id canônico morar na RPC.
 */

/** A série muda uma vez por dia (job das 05:00). 1h de atraso é irrelevante. */
const REVALIDAR_SEGUNDOS = 3600

export interface PontoDaCurva {
    /** dia da medição, YYYY-MM-DD */
    d: string
    /** rank do Deezer naquele dia (~60k obscuro a ~1M hit) */
    r: number
}

export interface CurvaDaFaixa {
    deezerTrackId: string
    genre: string | null
    observedSince: string
    firstRank: number | null
    lastRank: number | null
    series: PontoDaCurva[]
}

interface CurvaBruta {
    deezer_track_id?: string
    genre?: string | null
    observed_since?: string
    first_rank?: number | null
    last_rank?: number | null
    series?: PontoDaCurva[]
}

const buscar = unstable_cache(
    async (isrc: string): Promise<CurvaDaFaixa | null> => {
        const { data, error } = await supabasePublic.rpc('get_track_curve', {
            p_isrc: isrc,
        })

        if (error) {
            console.error('[observatorio] falha ao ler a curva:', error.message)
            return null
        }
        // Faixa que o Observatório ainda não viu: a RPC devolve null.
        if (!data) return null

        const bruta = data as CurvaBruta
        if (!bruta.deezer_track_id) return null

        return {
            deezerTrackId: bruta.deezer_track_id,
            genre: bruta.genre ?? null,
            observedSince: bruta.observed_since ?? '',
            firstRank: bruta.first_rank ?? null,
            lastRank: bruta.last_rank ?? null,
            series: Array.isArray(bruta.series) ? bruta.series : [],
        }
    },
    ['observatorio-curva'],
    { revalidate: REVALIDAR_SEGUNDOS, tags: ['observatorio'] }
)

/**
 * Curva de uma gravação pelo ISRC. Devolve null quando não há ISRC (o Spotify
 * nem sempre expõe) ou quando o Observatório ainda não mediu esta faixa — nos
 * dois casos a página simplesmente não mostra o bloco.
 */
export async function getTrackCurve(
    isrc: string | null | undefined
): Promise<CurvaDaFaixa | null> {
    if (!isrc) return null
    return buscar(isrc)
}

/**
 * Variação percentual entre a primeira e a última medição.
 *
 * Percentual, e não a diferença bruta, porque o rank do Deezer não tem unidade
 * legível: sair de 62.728 para 65.100 e de 940.438 para 975.000 são o mesmo
 * movimento relativo, e é o movimento que interessa.
 *
 * Devolve null com menos de dois pontos — um ponto não é tendência.
 */
export function variacaoDaCurva(serie: PontoDaCurva[]): number | null {
    if (serie.length < 2) return null
    const primeiro = serie[0].r
    const ultimo = serie[serie.length - 1].r
    if (!primeiro) return null
    return ((ultimo - primeiro) / primeiro) * 100
}
