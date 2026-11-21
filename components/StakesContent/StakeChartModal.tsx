'use client'

import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { formatMultiplier } from '@/utils/stakeMultiplier'
import styles from './Stakes.module.css'

// Gráfico de evolução da popularidade de um stake (série diária do Deezer).
// Abre em modal por cima da página de Stakes. A série vem de
// GET /api/stakes/[id]/snapshots (que proxia o backend → stake_snapshots).

type Snapshot = {
    date: string
    popularity: number
    dayGain: number
    pointsGain: number
}

type Props = {
    stakeId: string
    title: string
    artist: string
    baseline: number
    current: number
    /** maior popScore já atingido — é contra ele que o ganho é medido (028) */
    peak: number
    multiplier: number
    accumulatedPoints: number
    // série já carregada (vem do GET /stakes). Se vier, abre instantâneo;
    // se for undefined, o modal busca sozinho (fallback).
    initialSnapshots?: Snapshot[]
    onClose: () => void
}

const fmtInt = (n: number) => Math.round(n).toLocaleString('pt-BR')

function fmtDate(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
    }).format(d)
}

export default function StakeChartModal({
    stakeId,
    title,
    artist,
    baseline,
    current,
    peak,
    multiplier,
    accumulatedPoints,
    initialSnapshots,
    onClose,
}: Props) {
    const [snaps, setSnaps] = useState<Snapshot[] | null>(
        initialSnapshots ?? null
    )
    const [error, setError] = useState(false)
    const [hover, setHover] = useState<number | null>(null)

    // fichas de antes da 028 podem vir sem `peak`; nunca é menor que os dois
    // valores que já conhecemos
    const recorde = Math.max(
        Math.round(peak ?? 0),
        Math.round(baseline),
        Math.round(current)
    )

    // fecha no ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    useEffect(() => {
        // já temos a série (veio do GET /stakes): nada a buscar, abre instantâneo
        if (initialSnapshots !== undefined) return

        let alive = true
        setSnaps(null)
        setError(false)
        fetch(`/api/stakes/${stakeId}/snapshots`, { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((d) => {
                if (!alive) return
                setSnaps(Array.isArray(d.snapshots) ? d.snapshots : [])
            })
            .catch(() => alive && setError(true))
        return () => {
            alive = false
        }
    }, [stakeId, initialSnapshots])

    // domínio do eixo Y com auto-zoom (estilo Apple Health): aperta na faixa
    // real dos dados pra mostrar movimento, mas com rótulos honestos 0–100.
    const scale = useMemo(() => {
        const vals = (snaps ?? [])
            .map((s) => s.popularity)
            .concat(baseline, current, recorde)
        const lo = Math.min(...vals)
        const hi = Math.max(...vals)
        const span = hi - lo
        const pad = Math.max(2, span * 0.25)
        const yMin = Math.max(0, Math.floor(lo - pad))
        const yMax = Math.min(100, Math.ceil(hi + pad))
        const range = Math.max(1, yMax - yMin)
        return { yMin, yMax, range }
    }, [snaps, baseline, current, recorde])

    const yPct = (v: number) => ((v - scale.yMin) / scale.range) * 100 // 0–100% da altura do gráfico

    // dia em foco: hover, ou o último por padrão
    const focusIdx =
        hover != null
            ? hover
            : snaps && snaps.length > 0
              ? snaps.length - 1
              : null
    const focus = focusIdx != null && snaps ? snaps[focusIdx] : null

    const delta = Math.round(current) - Math.round(baseline)

    return (
        <div
            onClick={onClose}
            className={`anim-fade ${styles.backdrop} ${styles.backdropTop}`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ficha-grafico-title"
                className={`anim-pop ${styles.dialog} ${styles.dialogWide}`}
            >
                <div className={styles.dialogHead}>
                    <div>
                        <p className={styles.dialogKicker}>
                            Evolução da popularidade
                        </p>
                        <h3
                            id="ficha-grafico-title"
                            className={styles.dialogTitle}
                        >
                            {title}
                        </h3>
                        <p className={styles.dialogSub}>{artist}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className={styles.close}
                    >
                        <X size={17} aria-hidden="true" />
                    </button>
                </div>

                <div className={styles.chartBody}>
                    {/* readout do dia em foco */}
                    <div className={styles.readout}>
                        <div>
                            <div className={styles.readoutDate}>
                                {focus ? fmtDate(focus.date) : 'Popularidade'}
                            </div>
                            <div className={styles.readoutValue}>
                                <strong>
                                    {focus
                                        ? Math.round(focus.popularity)
                                        : Math.round(current)}
                                </strong>
                                <span>/ 100</span>
                            </div>
                        </div>
                        {focus && focus.pointsGain > 0 ? (
                            <span className={styles.readoutGain}>
                                +{fmtInt(focus.pointsGain)} pts nesse dia
                            </span>
                        ) : (
                            <span className={styles.readoutNote}>
                                {focus && focusIdx === 0
                                    ? 'dia da ficha'
                                    : 'sem ganho nesse dia'}
                            </span>
                        )}
                    </div>

                    {error ? (
                        <div className={styles.chartEmpty}>
                            Não foi possível carregar o histórico.
                        </div>
                    ) : snaps == null ? (
                        <div className={styles.chartSkeleton} aria-hidden="true">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="anim-pulse"
                                    style={{
                                        height: `${28 + ((i * 37) % 60)}%`,
                                    }}
                                />
                            ))}
                        </div>
                    ) : snaps.length === 0 ? (
                        <div className={styles.chartEmpty}>
                            Sem medições ainda.
                        </div>
                    ) : (
                        <Chart
                            snaps={snaps}
                            baseline={baseline}
                            recorde={recorde}
                            yPct={yPct}
                            yMin={scale.yMin}
                            yMax={scale.yMax}
                            hover={hover}
                            setHover={setHover}
                        />
                    )}

                    {/* legenda */}
                    <div className={styles.legend}>
                        <span>
                            <span
                                className={`${styles.swatch} ${styles.swatchEarned}`}
                            />
                            rendeu pontos
                        </span>
                        <span>
                            <span className={styles.swatch} />
                            sem ganho
                        </span>
                        <span>
                            <span className={styles.swatchBase} />
                            sua ficha ({Math.round(baseline)})
                        </span>
                        {recorde > Math.round(baseline) && (
                            <span>
                                <span className={styles.swatchRecord} />
                                recorde ({recorde})
                            </span>
                        )}
                    </div>

                    <div className={styles.summary}>
                        <span
                            className={
                                delta > 0 ? styles.summaryUp : styles.summaryFlat
                            }
                        >
                            {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'}{' '}
                            {Math.round(baseline)} → {Math.round(current)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                            multiplicador {formatMultiplier(Number(multiplier))}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{fmtInt(accumulatedPoints)} pts acumulados</span>
                    </div>

                    {/* A régua é o recorde, não a última medição: recuperar
                        terreno já andado não paga de novo (migration 028). Sem
                        esta linha o gráfico mostra a subida e o card mostra "+0",
                        e os dois parecem estar brigando. */}
                    <p className={styles.chartNote}>
                        {recorde > Math.round(current)
                            ? `Falta ${recorde - Math.round(current)} pra bater o recorde de ${recorde} e voltar a render. O que já rendeu está guardado.`
                            : 'Ela está no próprio recorde — daqui pra cima toda subida vira ponto.'}
                    </p>

                    {snaps && snaps.length === 1 && (
                        <p className={styles.chartNote}>
                            Medimos 1× por dia — volte amanhã pra ver a faixa
                            começar a desenhar a curva.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

function Chart({
    snaps,
    baseline,
    recorde,
    yPct,
    yMin,
    yMax,
    hover,
    setHover,
}: {
    snaps: Snapshot[]
    baseline: number
    recorde: number
    yPct: (v: number) => number
    yMin: number
    yMax: number
    hover: number | null
    setHover: (i: number | null) => void
}) {
    const baseY = yPct(baseline)
    const peakY = yPct(recorde)
    return (
        <div className={styles.chart}>
            {/* eixo Y */}
            <div className={styles.yAxis} aria-hidden="true">
                <span>{yMax}</span>
                <span>{Math.round((yMax + yMin) / 2)}</span>
                <span>{yMin}</span>
            </div>

            <div className={styles.plotWrap}>
                <div
                    className={styles.plot}
                    onMouseLeave={() => setHover(null)}
                >
                    {/* onde você botou a ficha */}
                    <div
                        className={styles.lineBase}
                        style={{ bottom: `${baseY}%` }}
                    />

                    {/* o recorde — a régua que precisa ser batida */}
                    {recorde > Math.round(baseline) && (
                        <div
                            className={styles.lineRecord}
                            style={{ bottom: `${peakY}%` }}
                        />
                    )}

                    <div className={styles.bars}>
                        {snaps.map((s, i) => {
                            const h = Math.max(2, yPct(s.popularity))
                            const earned = s.pointsGain > 0
                            const active = hover === i
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onMouseEnter={() => setHover(i)}
                                    onFocus={() => setHover(i)}
                                    className={styles.barSlot}
                                    aria-label={`${fmtDate(s.date)}: popularidade ${Math.round(s.popularity)}`}
                                >
                                    <div
                                        className={`${styles.barFill} ${earned ? styles.barFillEarned : ''}`}
                                        style={{
                                            height: `${h}%`,
                                            opacity:
                                                hover == null || active
                                                    ? 1
                                                    : 0.45,
                                        }}
                                    />
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* eixo X: primeira e última data */}
                <div className={styles.xAxis} aria-hidden="true">
                    <span>{fmtDate(snaps[0].date)}</span>
                    {snaps.length > 1 && (
                        <span>{fmtDate(snaps[snaps.length - 1].date)}</span>
                    )}
                </div>
            </div>
        </div>
    )
}
