// components/TrackCurve/TrackCurve.tsx
//
// A curva do Observatório na página de faixa: como a audiência desta gravação
// se moveu desde que o Mirsui começou a medir.
//
// Duas decisões de desenho que não são óbvias:
//
// 1. NADA DE VERDE E VERMELHO. A linha é sempre a cor de acento; quem carrega o
//    sinal é o número e a palavra. Seta verde para cima e vermelha para baixo é
//    linguagem de painel de corretora, e destoa do resto do site, que é acervo
//    editorial — não terminal financeiro.
//
// 2. UM PONTO NÃO É CURVA. Faixa recém-entrada tem uma medição só. Em vez de
//    desenhar um gráfico de um ponto (que parece defeito) ou esconder o bloco
//    (que perde a chance de explicar), o componente assume o estado: diz desde
//    quando está medindo e que a curva se forma na próxima. É honesto e ainda
//    dá um motivo para a pessoa voltar.

import type { CurvaDaFaixa } from '@/utils/observatoryService'
import { variacaoDaCurva } from '@/utils/observatoryService'

const MESES = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

function dataCurta(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`
}

function diasEntre(inicio: string, fim: string): number {
    const a = new Date(inicio).getTime()
    const b = new Date(fim).getTime()
    if (Number.isNaN(a) || Number.isNaN(b)) return 0
    return Math.max(0, Math.round((b - a) / 86_400_000))
}

/** Sparkline em SVG. Estica na largura; o traço não engorda junto. */
function Sparkline({ valores, gradId }: { valores: number[]; gradId: string }) {
    const L = 100
    const A = 32
    const PAD = 3

    const min = Math.min(...valores)
    const max = Math.max(...valores)
    const amplitude = max - min

    // Normalizar por min/max sozinho MENTE. Uma faixa que oscilou 0,05% em duas
    // semanas viraria uma cordilheira de ponta a ponta, ao lado de um texto
    // dizendo "Estável" — o desenho contradizendo o número.
    //
    // Então a altura ocupada é proporcional ao movimento REAL: 5% de variação
    // relativa já enche a caixa, e o que for menos desenha proporcionalmente
    // mais achatado, sempre centralizado. Movimento grande continua legível,
    // ruído continua parecendo ruído.
    const ESCALA_CHEIA = 0.05
    const relativo = min > 0 ? amplitude / min : 0
    const ocupacao = Math.min(1, relativo / ESCALA_CHEIA)

    const alturaUtil = (A - PAD * 2) * ocupacao
    const topo = (A - alturaUtil) / 2

    const pontos = valores.map((v, i) => {
        const x = valores.length === 1 ? L / 2 : (i / (valores.length - 1)) * L
        // Série sem variação nenhuma vira uma reta no meio, não uma divisão por zero.
        const y =
            amplitude === 0
                ? A / 2
                : topo + (1 - (v - min) / amplitude) * alturaUtil
        return `${x.toFixed(2)},${y.toFixed(2)}`
    })

    const linha = pontos.join(' ')
    const area = `0,${A} ${linha} ${L},${A}`

    return (
        <svg
            viewBox={`0 0 ${L} ${A}`}
            preserveAspectRatio="none"
            className="h-16 w-full"
            aria-hidden="true"
        >
            {/* Gradiente em vez de preenchimento chapado: sobre o fundo quente
                do site, um bloco de lime a 10% vira um retângulo oliva barrento
                e some com a forma da curva. Esmaecendo até zero, o que fica na
                retina é a linha. */}
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cdef36" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#cdef36" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={area} fill={`url(#${gradId})`} />
            <polyline
                points={linha}
                fill="none"
                stroke="#cdef36"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}

export default function TrackCurve({ curva }: { curva: CurvaDaFaixa }) {
    const { series } = curva
    if (series.length === 0) return null

    const medicoes = series.length
    const desde = dataCurta(series[0].d)
    const variacao = variacaoDaCurva(series)

    const rotulo = (
        <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mir-text3">
                ◦ Observatório
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] tabular-nums text-mir-text3">
                {medicoes} {medicoes === 1 ? 'medição' : 'medições'}
            </span>
        </div>
    )

    // --- Estado inicial: mede há pouco, ainda não há o que desenhar ---
    if (variacao === null) {
        return (
            <section className="rounded-xl border border-mir-line bg-mir-fill1 px-6 py-5">
                {rotulo}
                <p className="mt-4 text-[19px] font-bold leading-tight tracking-[-0.02em] text-mir-text">
                    Medindo desde {desde}.
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-mir-text2">
                    A curva se forma a partir da segunda medição — uma por dia.
                </p>
            </section>
        )
    }

    // --- Curva formada ---
    const dias = diasEntre(series[0].d, series[series.length - 1].d)
    const estavel = Math.abs(variacao) < 0.5
    const subiu = variacao > 0

    // pt-BR usa vírgula. "+46.2%" num produto brasileiro é erro, não estilo.
    const percentual = `${subiu ? '+' : ''}${variacao.toFixed(1)}`.replace('.', ',')
    const numero = estavel ? 'Estável' : `${percentual}%`

    // A cor de acento significa uma coisa só: subiu. Queda e estabilidade saem
    // em creme. Sem verde/vermelho, mas também sem pintar uma queda de 9% com a
    // mesma tinta de comemoração que uma alta.
    const corDoNumero = subiu && !estavel ? 'text-mir-acc' : 'text-mir-text'

    return (
        <section className="rounded-xl border border-mir-line bg-mir-fill1 px-6 py-5">
            {rotulo}

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                    className={`text-[38px] font-extrabold leading-none tracking-[-0.04em] tabular-nums ${corDoNumero}`}
                >
                    {numero}
                </span>
                <span className="text-[13.5px] text-mir-text2">
                    {estavel
                        ? `sem movimento desde ${desde}`
                        : `${subiu ? 'subiu' : 'caiu'} desde ${desde}`}
                    {dias > 0 && ` · ${dias} ${dias === 1 ? 'dia' : 'dias'}`}
                </span>
            </div>

            <div className="mt-5">
                <Sparkline
                    valores={series.map((p) => p.r)}
                    gradId={`curva-${curva.deezerTrackId}`}
                />
            </div>

            <p className="mt-4 border-t border-mir-line pt-3.5 font-mono text-[11px] leading-relaxed text-mir-text3">
                Audiência desta gravação no Deezer, medida pelo Mirsui uma vez
                por dia. Nenhuma plataforma publica esse histórico.
            </p>
        </section>
    )
}
