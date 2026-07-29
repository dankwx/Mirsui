'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shuffle, X } from 'lucide-react'
import { HEAT_LABEL, PILE_GENRES, type PileTrack } from '@/utils/pileTypes'
import { packPile } from './pileLayout'

const nf = new Intl.NumberFormat('pt-BR')

/* fundo tonal quando a faixa não tem capa — mesma família de tons do resto do app */
const TONES = [
    '#241f1a',
    '#1c2320',
    '#27201f',
    '#1b2026',
    '#231d27',
    '#202420',
    '#2a201b',
    '#1a2326',
    '#25211c',
    '#1d2126',
    '#26211f',
    '#1f231d',
]
function tone(seed: string) {
    let h = 0
    for (let i = 0; i < seed.length; i++)
        h = (h * 31 + seed.charCodeAt(i)) >>> 0
    return TONES[h % TONES.length]
}
function initials(name: string) {
    return (name || '')
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
function ago(dias: number) {
    if (dias < 30) return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
    const m = Math.round(dias / 30)
    return `há ${m} ${m === 1 ? 'mês' : 'meses'}`
}
function spotifySearch(t: PileTrack) {
    return `https://open.spotify.com/search/${encodeURIComponent(`${t.artist} ${t.title}`)}`
}

/* ---------- ficha da faixa, ao clicar numa peça ---------- */
function PieceSheet({
    track,
    onClose,
}: {
    track: PileTrack
    onClose: () => void
}) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', onKey)
            document.body.style.overflow = prev
        }
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-[70] flex animate-[mir-fade_.18s_ease-out] items-center justify-center p-5"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-mir-bg/80 backdrop-blur-md" />

            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[430px] animate-[mir-pop_.22s_cubic-bezier(.2,.9,.3,1.1)] overflow-hidden rounded-[20px] border border-mir-line2 bg-mir-surface shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
            >
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-mir-bg/70 text-mir-text2 backdrop-blur transition hover:text-mir-text"
                >
                    <X className="h-4 w-4" />
                </button>

                <div
                    className="relative aspect-square w-full"
                    style={{ background: tone(track.artist) }}
                >
                    <span className="absolute inset-0 grid select-none place-items-center text-[86px] font-extrabold tracking-[-0.05em] text-mir-text/10">
                        {initials(track.artist)}
                    </span>
                    {track.cover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={track.cover}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    )}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-mir-surface to-transparent" />
                </div>

                <div className="relative -mt-8 px-6 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-mir-acc/40 bg-mir-acc-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mir-acc">
                            {track.genre}
                        </span>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
                            {HEAT_LABEL[track.heat]}
                        </span>
                    </div>

                    <h2 className="mt-3 text-[26px] font-extrabold leading-[1.05] tracking-[-0.035em] text-mir-text">
                        {track.title}
                    </h2>
                    <p className="mt-1 font-mono text-[13px] tracking-[0.03em] text-mir-text2">
                        {track.artist}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-mir-line pt-4">
                        <div>
                            <div className="text-[22px] font-extrabold tabular-nums tracking-[-0.03em] text-mir-acc">
                                {nf.format(track.carimbos)}
                            </div>
                            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-mir-text3">
                                carimbos
                            </div>
                        </div>
                        <div>
                            <div className="text-[22px] font-extrabold tracking-[-0.03em] text-mir-text">
                                {ago(track.dias)}
                            </div>
                            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-mir-text3">
                                a primeira
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2.5">
                        <Link
                            href="/claimtrack"
                            className="flex-1 rounded-full bg-mir-acc px-5 py-3 text-center text-[14px] font-bold text-mir-on-acc transition hover:brightness-110 active:translate-y-px"
                        >
                            Carimbar essa
                        </Link>
                        <a
                            href={spotifySearch(track)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-mir-line2 px-5 py-3 text-[14px] font-semibold text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text active:translate-y-px"
                        >
                            Ouvir
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ---------- a pilha ---------- */
export default function Pile({ tracks }: { tracks: PileTrack[] }) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)
    const [run, setRun] = useState(0)
    const [genre, setGenre] = useState<string | null>(null)
    const [open, setOpen] = useState<PileTrack | null>(null)

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        // a pilha só existe depois de medir: as posições são em px, calculadas
        // a partir da largura real do container
        const ro = new ResizeObserver(([entry]) => {
            setWidth(Math.round(entry.contentRect.width))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const layout = useMemo(
        () => packPile(tracks, width, run + 1),
        [tracks, width, run]
    )

    const total = useMemo(
        () => tracks.reduce((s, t) => s + t.carimbos, 0),
        [tracks]
    )
    const matches = useMemo(
        () =>
            genre
                ? tracks.filter((t) => t.genre === genre).length
                : tracks.length,
        [genre, tracks]
    )

    const despejar = useCallback(() => {
        setGenre(null)
        setRun((r) => r + 1)
    }, [])

    return (
        <div className="pile-root">
            <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-10">
                {/* ---- cabeçalho ---- */}
                <header className="pt-9 sm:pt-12">
                    <Link
                        href="/feed"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-mir-text3 transition-colors hover:text-mir-text"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        voltar ao feed
                    </Link>

                    <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-[clamp(40px,7vw,86px)] font-extrabold leading-[0.88] tracking-[-0.055em] text-mir-text">
                                    A pilha
                                </h1>
                                <span className="mb-2 self-end rounded-full border border-mir-line2 px-2 py-[3px] font-mono text-[9.5px] uppercase tracking-[0.14em] text-mir-text3">
                                    prévia
                                </span>
                            </div>
                            <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.55] text-mir-text2">
                                Tudo que a cena carimbou, despejado num lugar
                                só.{' '}
                                <span className="text-mir-text3">
                                    Quanto maior a capa, mais gente carimbou.
                                    Passe o mouse para ver quem é.
                                </span>
                            </p>
                        </div>

                        <div className="flex items-end gap-8">
                            <div>
                                <div className="text-[30px] font-extrabold tabular-nums leading-none tracking-[-0.04em] text-mir-acc">
                                    {nf.format(tracks.length)}
                                </div>
                                <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
                                    faixas na pilha
                                </div>
                            </div>
                            <div>
                                <div className="text-[30px] font-extrabold tabular-nums leading-none tracking-[-0.04em] text-mir-text">
                                    {nf.format(total)}
                                </div>
                                <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
                                    carimbos
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ---- filtros ---- */}
                <div className="sticky top-[72px] z-30 -mx-5 mt-8 flex flex-wrap items-center gap-2 bg-mir-bg/85 px-5 py-3 backdrop-blur-xl sm:-mx-10 sm:px-10">
                    <button
                        onClick={() => setGenre(null)}
                        className={`pile-chip ${genre === null ? 'is-on' : ''}`}
                    >
                        tudo
                    </button>
                    {PILE_GENRES.map((g) => (
                        <button
                            key={g}
                            onClick={() =>
                                setGenre((cur) => (cur === g ? null : g))
                            }
                            className={`pile-chip ${genre === g ? 'is-on' : ''}`}
                        >
                            {g}
                        </button>
                    ))}

                    <button
                        onClick={despejar}
                        className="ml-auto inline-flex items-center gap-2 rounded-full border border-mir-line2 px-4 py-[7px] font-mono text-[11px] uppercase tracking-[0.1em] text-mir-text2 transition hover:border-mir-acc/60 hover:text-mir-acc active:translate-y-px"
                    >
                        <Shuffle className="h-3.5 w-3.5" />
                        despejar de novo
                    </button>
                </div>

                {genre && (
                    <p className="pt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-mir-text3">
                        {matches} {matches === 1 ? 'faixa' : 'faixas'} de{' '}
                        {genre} na pilha
                    </p>
                )}

                {/* ---- o mosaico ----
                    Fica no mesmo container dos filtros de propósito: se estivesse
                    em outra div, o bloco sticky perderia o contexto e os chips
                    sumiriam já nos primeiros 300px de rolagem da pilha. */}
                <div className="pb-24 pt-6">
                    <div
                        ref={wrapRef}
                        className="pile-stage"
                        style={{ height: layout.height || 620 }}
                    >
                        {layout.pieces.map((p) => {
                            const t = p.track
                            const dim = genre !== null && t.genre !== genre
                            const src = p.size > 170 ? t.cover : t.coverSmall

                            return (
                                <div
                                    key={`${run}-${t.id}`}
                                    className={`pile-slot ${dim ? 'is-dim' : ''}`}
                                    style={{
                                        left: p.x,
                                        top: p.y,
                                        width: p.size,
                                        height: p.size,
                                        zIndex: p.z,
                                    }}
                                    onClick={() => setOpen(t)}
                                >
                                    <div
                                        className="pile-piece"
                                        style={
                                            {
                                                '--r': `${p.rot}deg`,
                                                '--d': `${p.delay}ms`,
                                                background: tone(t.artist),
                                            } as React.CSSProperties
                                        }
                                    >
                                        <span className="pile-ini">
                                            {initials(t.artist)}
                                        </span>
                                        {src && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={src}
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                                draggable={false}
                                            />
                                        )}
                                    </div>

                                    <div
                                        className={`pile-tip pile-tip--${p.align}`}
                                    >
                                        <strong>{t.title}</strong>
                                        <span className="pile-tip-artist">
                                            {t.artist}
                                        </span>
                                        <span className="pile-tip-meta">
                                            {nf.format(t.carimbos)} carimbos ·{' '}
                                            {t.genre} · primeira {ago(t.dias)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}

                        {width === 0 && (
                            <div className="grid h-full place-items-center font-mono text-[12px] uppercase tracking-[0.14em] text-mir-text3">
                                despejando…
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {open && <PieceSheet track={open} onClose={() => setOpen(null)} />}
        </div>
    )
}
