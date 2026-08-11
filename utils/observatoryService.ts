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

/* ------------------------------------------------------------------ landing */

export interface FaixaDoObservatorio {
    spotifyId: string
    title: string
    artist: string
    cover: string | null
    genre: string | null
    /** 0-100, nível de audiência medido */
    audiencia: number
    /** variação % desde a primeira medição; null enquanto não houver série */
    variacao: number | null
}

export interface ObservatorioNaLanding {
    /** quantas faixas o Observatório mede hoje */
    medidas: number
    /** data da primeira medição */
    desde: string | null
    /**
     * Há variação medida em série longa o bastante para ser chamada de
     * tendência. Enquanto for false, a lista é o subsolo do radar — e o título
     * da seção precisa dizer isso, não prometer alta.
     */
    temMovimento: boolean
    faixas: FaixaDoObservatorio[]
}

interface LandingBruta {
    medidas?: number
    desde?: string | null
    tem_movimento?: boolean
    faixas?: {
        spotify_id?: string
        title?: string
        artist?: string
        md5?: string | null
        genre?: string | null
        audiencia?: number
        variacao?: number | null
    }[]
}

const buscarLanding = unstable_cache(
    async (limite: number): Promise<ObservatorioNaLanding | null> => {
        const { data, error } = await supabasePublic.rpc(
            'get_landing_observatory',
            { p_limite: limite }
        )

        if (error) {
            console.error('[observatorio] falha na landing:', error.message)
            return null
        }
        if (!data) return null

        const b = data as LandingBruta

        return {
            medidas: Number(b.medidas) || 0,
            desde: b.desde ?? null,
            temMovimento: !!b.tem_movimento,
            faixas: (b.faixas ?? []).flatMap((f) => {
                if (!f.spotify_id || !f.title || !f.artist) return []
                return [
                    {
                        spotifyId: f.spotify_id,
                        title: f.title,
                        artist: f.artist,
                        // mesma montagem de capa da Pilha (ver utils/pileService.ts)
                        cover: f.md5
                            ? `https://cdn-images.dzcdn.net/images/cover/${f.md5}/500x500-000000-80-0-0.jpg`
                            : null,
                        genre: f.genre ?? null,
                        audiencia: Number(f.audiencia) || 0,
                        variacao:
                            f.variacao == null ? null : Number(f.variacao),
                    },
                ]
            }),
        }
    },
    ['observatorio-landing'],
    { revalidate: REVALIDAR_SEGUNDOS, tags: ['observatorio', 'landing'] }
)

/** Resumo do Observatório para a home. Null se a consulta falhar. */
export async function getLandingObservatory(
    limite = 8
): Promise<ObservatorioNaLanding | null> {
    return buscarLanding(limite)
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
