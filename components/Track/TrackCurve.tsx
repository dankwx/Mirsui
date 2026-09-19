// components/Track/TrackCurve.tsx
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
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
import { dataCurta, diasEntre } from './format'
import styles from './TrackCurve.module.css'

/** A linha em SVG. Estica na largura; o traço não engorda junto. */
function Linha({ valores, gradId }: { valores: number[]; gradId: string }) {
    const L = 100
    const A = 40
    const PAD = 4

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
        return [x, y] as const
    })

    const linha = pontos
        .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
        .join(' ')
    const area = `0,${A} ${linha} ${L},${A}`
    const [fimX, fimY] = pontos[pontos.length - 1]

    // O SVG estica sem manter proporção, então o ponto final é HTML por cima:
    // um círculo dentro do SVG viraria uma elipse.
    return (
        <div className={styles.chart} aria-hidden="true">
            <svg viewBox={`0 0 ${L} ${A}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="0%"
                            stopColor="var(--club-accent)"
                            stopOpacity="0.18"
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--club-accent)"
                            stopOpacity="0"
                        />
                    </linearGradient>
                </defs>
                <polygon points={area} fill={`url(#${gradId})`} />
                <polyline
                    points={linha}
                    fill="none"
                    stroke="var(--club-accent)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            <span
                className={styles.endpoint}
                style={{ left: `${fimX}%`, top: `${(fimY / A) * 100}%` }}
            />
        </div>
    )
}

export default function TrackCurve({ curva }: { curva: CurvaDaFaixa }) {
    const { series } = curva
    if (series.length === 0) return null

    const medicoes = series.length
    const desde = dataCurta(series[0].d)
    const ate = dataCurta(series[series.length - 1].d)
    const variacao = variacaoDaCurva(series)

    // --- Estado inicial: mede há pouco, ainda não há o que desenhar ---
    if (variacao === null) {
        return (
            <section
                className={styles.section}
                aria-labelledby="observatorio-title"
            >
                <div className={`${shellStyles.container} ${styles.grid}`}>
                    <div className={styles.copy}>
                        <h2 id="observatorio-title">Observatório</h2>
                        <p>
                            Audiência desta gravação no Deezer, medida pelo
                            Mirsui uma vez por dia. Nenhuma plataforma publica
                            esse histórico.
                        </p>
                    </div>
                    <div className={styles.reading}>
                        <p className={styles.headline}>
                            Medindo desde {desde}.
                        </p>
                        <p className={styles.support}>
                            A curva se forma a partir da segunda medição — uma
                            por dia. Volte amanhã.
                        </p>
                    </div>
                </div>
            </section>
        )
    }

    // --- Curva formada ---
    const dias = diasEntre(series[0].d, series[series.length - 1].d)
    const estavel = Math.abs(variacao) < 0.5
    const subiu = variacao > 0

    // pt-BR usa vírgula. "+46.2%" num produto brasileiro é erro, não estilo.
    const percentual = `${subiu ? '+' : ''}${variacao.toFixed(1)}`.replace(
        '.',
        ','
    )
    const numero = estavel ? 'Estável' : `${percentual}%`

    return (
        <section
            className={styles.section}
            aria-labelledby="observatorio-title"
        >
            <div className={`${shellStyles.container} ${styles.grid}`}>
                <div className={styles.copy}>
                    <h2 id="observatorio-title">Observatório</h2>
                    <p>
                        Audiência desta gravação no Deezer, medida pelo Mirsui
                        uma vez por dia. Nenhuma plataforma publica esse
                        histórico.
                    </p>
                </div>

                <div className={styles.reading}>
                    <div className={styles.numbers}>
                        {/* A cor de acento significa uma coisa só: subiu. Queda e
                            estabilidade saem na tinta do texto. */}
                        <span
                            className={`${styles.value} ${subiu && !estavel ? styles.valueUp : ''}`}
                        >
                            {numero}
                        </span>
                        <span className={styles.meaning}>
                            {estavel
                                ? `sem movimento desde ${desde}`
                                : `${subiu ? 'subiu' : 'caiu'} desde ${desde}`}
                            {dias > 0 &&
                                ` · ${dias} ${dias === 1 ? 'dia' : 'dias'}`}
                        </span>
                    </div>

                    <Linha
                        valores={series.map((p) => p.r)}
                        gradId={`curva-${curva.deezerTrackId}`}
                    />

                    <div className={`${recipes.smallNumber} ${styles.axis}`}>
                        <span>{desde}</span>
                        <span>
                            {medicoes} {medicoes === 1 ? 'medição' : 'medições'}
                        </span>
                        <span>{ate}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
