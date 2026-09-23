'use client'

// components/Track/LinhaDaCurva.tsx
//
// O desenho da curva do Observatório e a leitura de cada dia medido.
//
// A linha sozinha dizia que algo mexeu, mas não o quê nem quanto: o gráfico
// não tinha escala, e o valor medido não aparecia em lugar nenhum. Agora cada
// medição se lê no próprio gráfico — passando o mouse, tocando (arrastar
// percorre os dias) ou com as setas do teclado — na MESMA escala 0-100 da
// "Audiência hoje" do recibo, via `popScore`.
//
// A linha vertical encontra o dia: ninguém precisa mirar num traço de 2 px, o
// dia mais próximo do ponteiro é o que se lê.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import type { PontoDaCurva } from '@/utils/observatoryService'
import { popScore } from '@/utils/popScore'
import recipes from '@/components/Club/club-recipes.module.css'
import { dataCurta, diasEntre, percentual } from './format'
import styles from './TrackCurve.module.css'

const L = 100
const A = 40
const PAD = 4

// Normalizar por min/max sozinho MENTE. Uma faixa que oscilou 0,05% em duas
// semanas viraria uma cordilheira de ponta a ponta, ao lado de um texto
// dizendo "Estável" — o desenho contradizendo o número.
//
// Então a altura ocupada é proporcional ao movimento REAL: 5% de variação
// relativa já enche a caixa, e o que for menos desenha proporcionalmente
// mais achatado, sempre centralizado. Movimento grande continua legível,
// ruído continua parecendo ruído.
const ESCALA_CHEIA = 0.05

function geometria(valores: number[]): (readonly [number, number])[] {
    const min = Math.min(...valores)
    const max = Math.max(...valores)
    const amplitude = max - min

    const relativo = min > 0 ? amplitude / min : 0
    const ocupacao = Math.min(1, relativo / ESCALA_CHEIA)

    const alturaUtil = (A - PAD * 2) * ocupacao
    const topo = (A - alturaUtil) / 2

    return valores.map((v, i) => {
        const x = valores.length === 1 ? L / 2 : (i / (valores.length - 1)) * L
        // Série sem variação nenhuma vira uma reta no meio, não uma divisão por zero.
        const y =
            amplitude === 0
                ? A / 2
                : topo + (1 - (v - min) / amplitude) * alturaUtil
        return [x, y] as const
    })
}

/**
 * O que um dia da curva diz, em texto: a audiência 0-100 e quanto ela mudou
 * em relação à medição anterior. "No dia" só quando a anterior é de fato a
 * véspera — com lacuna, a comparação diz desde quando.
 */
function leituraDoDia(serie: PontoDaCurva[], i: number) {
    const ponto = serie[i]
    const audiencia = popScore(ponto.r)
    const anterior = i > 0 ? serie[i - 1] : null

    let mudanca = 'primeira medição'
    let subiu = false
    if (anterior) {
        const quando =
            diasEntre(anterior.d, ponto.d) === 1
                ? 'no dia'
                : `desde ${dataCurta(anterior.d)}`
        const variacao = anterior.r
            ? ((ponto.r - anterior.r) / anterior.r) * 100
            : 0
        if (Math.abs(variacao) < 0.05) {
            mudanca = `sem mudança ${quando}`
        } else {
            mudanca = `${percentual(variacao)} ${quando}`
            subiu = variacao > 0
        }
    }

    return { data: dataCurta(ponto.d), audiencia, mudanca, subiu }
}

export default function LinhaDaCurva({
    serie,
    gradId,
}: {
    serie: PontoDaCurva[]
    gradId: string
}) {
    const [ativo, setAtivo] = useState<number | null>(null)
    const caixa = useRef<HTMLDivElement>(null)

    const pontos = useMemo(() => geometria(serie.map((p) => p.r)), [serie])
    const ultimo = serie.length - 1

    // No toque não existe "tirar o mouse": a leitura fica até tocar fora.
    const aberto = ativo !== null
    useEffect(() => {
        if (!aberto) return
        const fora = (e: globalThis.PointerEvent) => {
            if (!caixa.current?.contains(e.target as Node)) setAtivo(null)
        }
        document.addEventListener('pointerdown', fora)
        return () => document.removeEventListener('pointerdown', fora)
    }, [aberto])

    const lerNoPonteiro = (e: PointerEvent<HTMLDivElement>) => {
        const r = caixa.current?.getBoundingClientRect()
        if (!r || r.width === 0) return
        const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
        setAtivo(Math.round(f * ultimo))
    }

    const navegar = (e: KeyboardEvent<HTMLDivElement>) => {
        const atual = ativo ?? ultimo
        const destino: Record<string, number> = {
            ArrowLeft: atual - 1,
            ArrowDown: atual - 1,
            ArrowRight: atual + 1,
            ArrowUp: atual + 1,
            Home: 0,
            End: ultimo,
        }
        if (e.key === 'Escape') {
            setAtivo(null)
            return
        }
        if (!(e.key in destino)) return
        e.preventDefault()
        setAtivo(Math.min(ultimo, Math.max(0, destino[e.key])))
    }

    const linha = pontos
        .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
        .join(' ')
    const area = `0,${A} ${linha} ${L},${A}`
    const [fimX, fimY] = pontos[ultimo]

    // Quem usa leitor de tela ouve o mesmo que o tooltip mostra.
    const lido = leituraDoDia(serie, ativo ?? ultimo)
    const textoLido = `${lido.data}: audiência ${lido.audiencia} de 100, ${lido.mudanca}`

    const foco = ativo === null ? null : pontos[ativo]
    const focoX = foco?.[0] ?? 0
    const focoY = foco ? (foco[1] / A) * 100 : 0

    // O SVG estica sem manter proporção, então os pontos são HTML por cima: um
    // círculo dentro do SVG viraria uma elipse.
    return (
        <div
            ref={caixa}
            className={styles.chart}
            role="slider"
            tabIndex={0}
            aria-label="Audiência por dia medido"
            aria-valuemin={0}
            aria-valuemax={ultimo}
            aria-valuenow={ativo ?? ultimo}
            aria-valuetext={textoLido}
            onPointerDown={lerNoPonteiro}
            onPointerMove={lerNoPonteiro}
            onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') setAtivo(null)
            }}
            onFocus={() => setAtivo((a) => a ?? ultimo)}
            onBlur={() => setAtivo(null)}
            onKeyDown={navegar}
        >
            <svg
                viewBox={`0 0 ${L} ${A}`}
                preserveAspectRatio="none"
                aria-hidden="true"
            >
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

            {foco && (
                <>
                    <span
                        className={styles.crosshair}
                        style={{ left: `${focoX}%` }}
                    />
                    <span
                        className={styles.endpoint}
                        style={{ left: `${focoX}%`, top: `${focoY}%` }}
                    />
                    {/* Desliza junto com o dia: no início da curva abre para a
                        direita, no fim para a esquerda, e nunca sai da caixa.
                        Ponto na metade de cima, leitura embaixo — e vice-versa. */}
                    <div
                        className={styles.tip}
                        aria-hidden="true"
                        style={{
                            left: `${focoX}%`,
                            top: `${focoY}%`,
                            transform: `translate(-${focoX}%, ${
                                focoY < 45 ? '14px' : 'calc(-100% - 14px)'
                            })`,
                        }}
                    >
                        <span className={styles.tipDate}>{lido.data}</span>
                        <span className={styles.tipValue}>
                            <strong className={recipes.smallNumber}>
                                {lido.audiencia}
                                <span>/100</span>
                            </strong>
                            audiência
                        </span>
                        <span
                            className={`${styles.tipChange} ${lido.subiu ? styles.tipUp : ''}`}
                        >
                            {lido.mudanca}
                        </span>
                    </div>
                </>
            )}
        </div>
    )
}
