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

import type { CurvaDaFaixa, NotaDoSalto } from '@/utils/observatoryService'
import { variacaoDaCurva } from '@/utils/observatoryService'
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
import { popScore } from '@/utils/popScore'
import LinhaDaCurva from './LinhaDaCurva'
import Subsolo from './Subsolo'
import { dataCurta, diasEntre, percentual } from './format'
import styles from './TrackCurve.module.css'

/**
 * Em que ponto da série cai o dia da nota: o último dia medido até ele. Nota
 * de antes da primeira medição desta edição fica sem número na curva (mas
 * continua na lista).
 */
function indiceDoDia(serie: CurvaDaFaixa['series'], dia: string): number {
    let indice = -1
    for (let i = 0; i < serie.length && serie[i].d <= dia; i++) indice = i
    return indice
}

function nomeDaFonte(nota: NotaDoSalto): string {
    if (nota.fonteNome) return nota.fonteNome
    try {
        return new URL(nota.fonteUrl ?? '').hostname.replace(/^www\./, '')
    } catch {
        return 'link'
    }
}

export default function TrackCurve({
    curva,
    notas = [],
}: {
    curva: CurvaDaFaixa
    notas?: NotaDoSalto[]
}) {
    const { series } = curva
    if (series.length === 0) return null

    const medicoes = series.length
    const desde = dataCurta(series[0].d)
    const ate = dataCurta(series[series.length - 1].d)
    const variacao = variacaoDaCurva(series)
    // A audiência de hoje: o último ponto, na escala 0-100 do recibo.
    const hoje = popScore(series[series.length - 1].r)

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
                        <Subsolo audiencia={hoje} />
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
    const leitura = estavel
        ? `sem movimento desde ${desde} · audiência ${hoje}/100`
        : inicio === hoje
          ? `audiência ${subiu ? 'subiu' : 'caiu'} desde ${desde} · ${hoje}/100`
          : `audiência ${subiu ? 'subiu' : 'caiu'} de ${inicio} para ${hoje}/100 desde ${desde}`

    // O número da nota é a ordem dos dias: a 1 é o salto mais antigo. O mesmo
    // número aparece no ponto da curva e na lista logo abaixo dela.
    const notasNumeradas = notas.map((nota, i) => ({
        ...nota,
        numero: i + 1,
        indice: indiceDoDia(series, nota.dia),
    }))
    const marcas = notasNumeradas
        .filter((n) => n.indice >= 0)
        .map((n) => ({ indice: n.indice, numero: n.numero }))

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
                    <Subsolo audiencia={hoje} />
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
                        marcas={marcas}
                    />

                    <div className={`${recipes.smallNumber} ${styles.axis}`}>
                        <span>{desde}</span>
                        <span>
                            {medicoes} {medicoes === 1 ? 'medição' : 'medições'}
                        </span>
                        <span>{ate}</span>
                    </div>

                    {/* O porquê dos saltos. Só existe quando o dono escreveu:
                        salto sem nota não ganha número nem texto. */}
                    {notasNumeradas.length > 0 && (
                        <ol className={styles.notas} aria-label="Por que subiu">
                            {notasNumeradas.map((nota) => (
                                <li key={nota.numero} className={styles.nota}>
                                    <span
                                        className={styles.notaNumero}
                                        aria-hidden="true"
                                    >
                                        {nota.numero}
                                    </span>
                                    <p className={styles.notaQuando}>
                                        {dataCurta(nota.dia)}
                                        {nota.pontos > 0 && (
                                            <>
                                                {' · '}
                                                <strong>+{nota.pontos}</strong>
                                            </>
                                        )}
                                    </p>
                                    <p className={styles.notaTexto}>
                                        {nota.texto}
                                    </p>
                                    {nota.fonteUrl && (
                                        <a
                                            className={styles.notaFonte}
                                            href={nota.fonteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                        >
                                            Fonte: {nomeDaFonte(nota)}{' '}
                                            <span aria-hidden="true">↗</span>
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </section>
    )
}
