import 'server-only'
import { carregarDadosDaFaixa } from '@/utils/trackPageService'
import { variacaoDaCurva } from '@/utils/observatoryService'
import { capaDoAcervo } from '@/utils/homeService'
import { enderecoDaFaixa } from '@/utils/trackHref'
import type { RecentActivityItem } from '@/utils/homepageService'

/**
 * A ficha que abre a home.
 *
 * O hero não mostra uma ilustração do produto: mostra o produto. Uma gravação
 * de verdade, com a curva que o Observatório mediu e as pessoas que salvaram,
 * na ordem em que chegaram. É o mesmo bloco que existe na página de faixa,
 * só que escolhido para contar a história inteira em um olhar.
 *
 * A escolha é por dado, não por mão: entre as gravações que mais de uma pessoa
 * salvou, fica a que mais subiu desde a primeira medição. Empate desempata
 * pela mais escondida (rank menor). Quando ninguém repetiu faixa, vale a
 * salva mais recente que tenha capa e curva.
 */

export interface QuemChegou {
    position: number
    username: string
    nome: string
    avatar: string | null
    /** ISO do salvamento */
    quando: string | null
}

export interface FichaDaHome {
    isrc: string
    titulo: string
    artista: string
    capa: string | null
    href: string
    /** rank medido, um por dia */
    serie: number[]
    /** YYYY-MM-DD da primeira medição */
    desde: string | null
    /** % desde a primeira medição; null sem série */
    variacao: number | null
    salvamentos: number
    quem: QuemChegou[]
}

interface Candidata {
    isrc: string
    vezes: number
    ultima: string
}

function candidatas(achados: RecentActivityItem[]): Candidata[] {
    const mapa = new Map<string, Candidata>()
    for (const a of achados) {
        if (!a.isrc) continue
        const c = mapa.get(a.isrc)
        if (c) {
            c.vezes++
            if (a.claimedat > c.ultima) c.ultima = a.claimedat
        } else {
            mapa.set(a.isrc, { isrc: a.isrc, vezes: 1, ultima: a.claimedat })
        }
    }
    return Array.from(mapa.values())
        .sort((a, b) => b.vezes - a.vezes || (a.ultima < b.ultima ? 1 : -1))
        .slice(0, 5)
}

export async function getFichaDaHome(
    achados: RecentActivityItem[]
): Promise<FichaDaHome | null> {
    const lista = candidatas(achados)
    if (lista.length === 0) return null

    const fichas = await Promise.all(
        lista.map(async (c) => {
            const d = await carregarDadosDaFaixa(c.isrc)
            const o = d.observada
            if (!o || !o.coverMd5 || !d.curva || d.curva.series.length < 2) {
                return null
            }
            const quem: QuemChegou[] = d.quemSalvou.flatMap((q) => {
                const p = (Array.isArray(q.profiles) ? q.profiles[0] : q.profiles) as
                    | { username?: string; display_name?: string | null; avatar_url?: string | null }
                    | null
                if (!p?.username || q.position == null) return []
                return [
                    {
                        position: q.position,
                        username: p.username,
                        nome: p.display_name || p.username,
                        avatar: p.avatar_url ?? null,
                        quando: q.claimedat,
                    },
                ]
            })
            if (quem.length === 0) return null

            const serie = d.curva.series.map((p) => p.r)
            return {
                ficha: {
                    isrc: o.isrc,
                    titulo: o.title,
                    artista: o.artistName,
                    capa: capaDoAcervo(o.coverMd5, 500),
                    href: enderecoDaFaixa(o.isrc, o.artistName, o.title),
                    serie,
                    desde: d.curva.series[0]?.d ?? null,
                    variacao: variacaoDaCurva(d.curva.series),
                    salvamentos: d.salvamentos,
                    quem,
                } satisfies FichaDaHome,
                vezes: c.vezes,
                rank: o.lastRank ?? Infinity,
            }
        })
    )

    const validas = fichas.filter((f): f is NonNullable<typeof f> => f !== null)
    if (validas.length === 0) return null

    validas.sort(
        (a, b) =>
            b.vezes - a.vezes ||
            (b.ficha.variacao ?? -Infinity) - (a.ficha.variacao ?? -Infinity) ||
            a.rank - b.rank
    )
    return validas[0].ficha
}
