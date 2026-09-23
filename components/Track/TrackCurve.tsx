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
import { popScore } from '@/utils/popScore'
import LinhaDaCurva from './LinhaDaCurva'
import { dataCurta, diasEntre, percentual } from './format'
import styles from './TrackCurve.module.css'

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
                            Audiência desta gravação no Deezer, de
                            0&nbsp;a&nbsp;100, medida pelo Mirsui uma vez por
                            dia. Nenhuma plataforma publica esse histórico.
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

    const numero = estavel ? 'Estável' : percentual(variacao)

    // O percentual sozinho não dizia O QUE subiu. A frase diz, na escala 0-100
    // da "Audiência hoje" do recibo — e sem depender de hover, que o celular
    // não tem. O percentual continua vindo do rank bruto, mais fino que o
    // número arredondado: 83 e 83 podem ser um +0,9% de verdade.
    const inicio = popScore(series[0].r)
    const hoje = popScore(series[series.length - 1].r)
    const leitura = estavel
        ? `sem movimento desde ${desde} · audiência ${hoje}/100`
        : inicio === hoje
          ? `audiência ${subiu ? 'subiu' : 'caiu'} desde ${desde} · ${hoje}/100`
          : `audiência ${subiu ? 'subiu' : 'caiu'} de ${inicio} para ${hoje}/100 desde ${desde}`

    return (
        <section
            className={styles.section}
            aria-labelledby="observatorio-title"
        >
            <div className={`${shellStyles.container} ${styles.grid}`}>
                <div className={styles.copy}>
                    <h2 id="observatorio-title">Observatório</h2>
                    <p>
                        Audiência desta gravação no Deezer, de
                        0&nbsp;a&nbsp;100, medida pelo Mirsui uma vez por dia.
                        Nenhuma plataforma publica esse histórico.
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
                            {leitura}
                            {dias > 0 &&
                                ` · ${dias}\u00a0${dias === 1 ? 'dia' : 'dias'}`}
                        </span>
                    </div>

                    <LinhaDaCurva
                        serie={series}
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
