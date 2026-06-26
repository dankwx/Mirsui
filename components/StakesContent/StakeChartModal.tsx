'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatMultiplier } from '@/utils/stakeMultiplier'

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
    multiplier: number
    accumulatedPoints: number
    // série já carregada (vem do GET /stakes). Se vier, abre instantâneo;
    // se for undefined, o modal busca sozinho (fallback).
    initialSnapshots?: Snapshot[]
    onClose: () => void
}

const ACC = '#cdef36'
const MUTED = 'rgba(236,227,210,.22)'

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
        const vals = (snaps ?? []).map((s) => s.popularity).concat(baseline, current)
        const lo = Math.min(...vals)
        const hi = Math.max(...vals)
        const span = hi - lo
        const pad = Math.max(2, span * 0.25)
        const yMin = Math.max(0, Math.floor(lo - pad))
        const yMax = Math.min(100, Math.ceil(hi + pad))
        const range = Math.max(1, yMax - yMin)
        return { yMin, yMax, range }
    }, [snaps, baseline, current])

    const yPct = (v: number) =>
        ((v - scale.yMin) / scale.range) * 100 // 0–100% da altura do gráfico

    // dia em foco: hover, ou o último por padrão
    const focusIdx =
        hover != null
            ? hover
            : snaps && snaps.length > 0
              ? snaps.length - 1
              : null
    const focus = focusIdx != null && snaps ? snaps[focusIdx] : null

    const delta = Math.round(current) - Math.round(baseline)
    const deltaColor = delta > 0 ? ACC : delta < 0 ? '#d98359' : 'rgba(236,227,210,.6)'

    return (
        <div
            onClick={onClose}
            className="anim-fade fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-[rgba(8,6,3,0.72)] px-5 py-12 backdrop-blur-md"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="anim-pop w-full max-w-[620px] overflow-hidden rounded-[18px] border border-mir-line2/80 bg-[#1c160e] shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)]"
            >
                {/* header */}
                <div className="flex items-start justify-between gap-4 border-b border-mir-line px-6 py-[22px]">
                    <div className="min-w-0">
                        <div className="mb-[7px] font-mono text-[10px] tracking-[0.18em] text-mir-acc">
                            EVOLUÇÃO DA POPULARIDADE
                        </div>
                        <h3 className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[23px] font-black tracking-[-0.035em]">
                            {title}
                        </h3>
                        <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[12px] text-mir-text2/[0.8]">
                            {artist}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-full border border-mir-line2 bg-transparent text-base leading-[0] text-mir-text/70"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-6 pb-6 pt-5">
                    {/* readout do dia em foco */}
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <div className="font-mono text-[10px] tracking-[0.12em] text-mir-text2/[0.6]">
                                {focus ? fmtDate(focus.date) : 'POPULARIDADE'}
                            </div>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-[40px] font-black leading-[0.85] tracking-[-0.04em] text-mir-text">
                                    {focus ? Math.round(focus.popularity) : Math.round(current)}
                                </span>
                                <span className="font-mono text-[12px] text-mir-text2/60">
                                    / 100
                                </span>
                            </div>
                        </div>
                        {focus && focus.pointsGain > 0 ? (
                            <span className="flex-none rounded-full bg-mir-acc/20 px-3 py-1.5 font-mono text-[12px] font-bold text-mir-acc">
                                +{fmtInt(focus.pointsGain)} pts nesse dia
                            </span>
                        ) : (
                            <span className="flex-none font-mono text-[11px] text-mir-text2/55">
                                {focus && focusIdx === 0
                                    ? 'dia do stake'
                                    : 'sem ganho nesse dia'}
                            </span>
                        )}
                    </div>

                    {/* chart */}
                    {error ? (
                        <div className="flex h-[200px] items-center justify-center text-center font-mono text-[12px] text-mir-text2/60">
                            Não foi possível carregar o histórico.
                        </div>
                    ) : snaps == null ? (
                        <div className="flex h-[200px] items-end gap-[6px] px-1">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="anim-pulse flex-1 rounded-t-[3px] bg-mir-text2/10"
                                    style={{ height: `${28 + ((i * 37) % 60)}%` }}
                                />
                            ))}
                        </div>
                    ) : snaps.length === 0 ? (
                        <div className="flex h-[200px] items-center justify-center text-center font-mono text-[12px] text-mir-text2/60">
                            Sem medições ainda.
                        </div>
                    ) : (
                        <Chart
                            snaps={snaps}
                            baseline={baseline}
                            yPct={yPct}
                            yMin={scale.yMin}
                            yMax={scale.yMax}
                            hover={hover}
                            setHover={setHover}
                        />
                    )}

                    {/* legenda / rodapé */}
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-mir-line pt-4 font-mono text-[10.5px] text-mir-text2/70">
                        <span className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-2.5 w-2.5 rounded-[2px]"
                                style={{ background: ACC }}
                            />
                            rendeu pontos
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-2.5 w-2.5 rounded-[2px]"
                                style={{ background: MUTED }}
                            />
                            sem ganho
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block h-0 w-3.5 border-t border-dashed border-mir-text/50" />
                            seu stake ({Math.round(baseline)})
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-mir-text2/[0.8]">
                        <span style={{ color: deltaColor }}>
                            {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'}{' '}
                            {Math.round(baseline)} → {Math.round(current)}
                        </span>
                        <span className="opacity-40">·</span>
                        <span>multiplicador {formatMultiplier(Number(multiplier))}</span>
                        <span className="opacity-40">·</span>
                        <span>{fmtInt(accumulatedPoints)} pts acumulados</span>
                    </div>

                    {snaps && snaps.length === 1 && (
                        <div className="mt-3 font-mono text-[10.5px] leading-[1.5] text-mir-text2/55">
                            Medimos 1× por dia — volte amanhã pra ver a faixa começar
                            a desenhar a curva.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Chart({
    snaps,
    baseline,
    yPct,
    yMin,
    yMax,
    hover,
    setHover,
}: {
    snaps: Snapshot[]
    baseline: number
    yPct: (v: number) => number
    yMin: number
    yMax: number
    hover: number | null
    setHover: (i: number | null) => void
}) {
    const baseY = yPct(baseline)
    return (
        <div className="flex gap-3">
            {/* eixo Y */}
            <div className="flex h-[200px] w-7 flex-none flex-col justify-between py-[2px] text-right font-mono text-[9px] text-mir-text2/45">
                <span>{yMax}</span>
                <span>{Math.round((yMax + yMin) / 2)}</span>
                <span>{yMin}</span>
            </div>

            {/* plot */}
            <div className="min-w-0 flex-1">
                <div
                    className="relative h-[200px]"
                    onMouseLeave={() => setHover(null)}
                >
                    {/* linha de baseline (onde você deu stake) */}
                    <div
                        className="pointer-events-none absolute inset-x-0 border-t border-dashed border-mir-text/40"
                        style={{ bottom: `${baseY}%` }}
                    />

                    {/* barras */}
                    <div className="absolute inset-0 flex items-end gap-[5px]">
                        {snaps.map((s, i) => {
                            const h = Math.max(2, yPct(s.popularity))
                            const earned = s.pointsGain > 0
                            const active = hover === i
                            return (
                                <button
                                    key={i}
                                    onMouseEnter={() => setHover(i)}
                                    onFocus={() => setHover(i)}
                                    className="group relative flex h-full flex-1 cursor-default items-end border-none bg-transparent p-0"
                                    aria-label={`${fmtDate(s.date)}: popularidade ${Math.round(s.popularity)}`}
                                >
                                    <div
                                        className="w-full rounded-t-[3px] transition-[opacity,transform] duration-150"
                                        style={{
                                            height: `${h}%`,
                                            background: earned ? ACC : MUTED,
                                            opacity:
                                                hover == null || active ? 1 : 0.45,
                                        }}
                                    />
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* eixo X: primeira e última data */}
                <div className="mt-2 flex justify-between font-mono text-[9px] text-mir-text2/45">
                    <span>{fmtDate(snaps[0].date)}</span>
                    {snaps.length > 1 && (
                        <span>{fmtDate(snaps[snaps.length - 1].date)}</span>
                    )}
                </div>
            </div>
        </div>
    )
}
