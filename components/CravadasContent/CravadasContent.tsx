'use client'

import { useState, type CSSProperties } from 'react'

// Trava padrão (em dias) e estado inicial dos slots expandidos.
const LOCK_DAYS = 7
const START_EXPANDED = false

type Palette = { bg: string; fg: string; mut: string }
type CoverSize = 'big' | 'slot' | 'row'

type Track = {
    id: string
    title: string
    artist: string
    pop: number
    mult: string
    cravando: number
}

type Slot = {
    id: string
    title: string
    artist: string
    pop: number
    mult: string
    cravando: number
    delta: string
    daysLeft?: number
    recolherDate?: string
    status: 'travada' | 'livre'
}

// ---- covers ----
const PALETTES: Palette[] = [
    { bg: '#cdef36', fg: '#16120c', mut: 'rgba(22,18,12,.6)' },
    { bg: '#16120c', fg: '#ece3d2', mut: 'rgba(236,227,210,.5)' },
    { bg: '#c14a26', fg: '#f7ead7', mut: 'rgba(247,234,215,.62)' },
    { bg: '#e3d8c1', fg: '#16120c', mut: 'rgba(22,18,12,.5)' },
    { bg: '#27203a', fg: '#e7ddff', mut: 'rgba(231,221,255,.55)' },
    { bg: '#173a4a', fg: '#dcf0fb', mut: 'rgba(220,240,251,.55)' },
    { bg: '#3f3f17', fg: '#eef36a', mut: 'rgba(238,243,106,.6)' },
]

function hash(s: string): number {
    let h = 0
    for (let i = 0; i < s.length; i++) {
        h = (h * 31 + s.charCodeAt(i)) >>> 0
    }
    return h
}

type CoverStyles = { surf: CSSProperties; artistS: CSSProperties; titleS: CSSProperties }

function coverStyles(p: Palette, size: CoverSize): CoverStyles {
    const map = {
        big: { pad: '11px', t: '19px', a: '8.5px' },
        slot: { pad: '10px', t: '16px', a: '8px' },
        row: { pad: '8px', t: '13px', a: '7px' },
    }
    const s = map[size] || map.row
    return {
        surf: {
            position: 'absolute',
            inset: 0,
            background: p.bg,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: s.pad,
            overflow: 'hidden',
        },
        artistS: {
            fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
            fontSize: s.a,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: p.mut,
            marginBottom: '3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
        },
        titleS: {
            fontFamily: 'var(--font-hanken), system-ui, sans-serif',
            fontWeight: 800,
            fontSize: s.t,
            lineHeight: '.95',
            letterSpacing: '-.025em',
            color: p.fg,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
        },
    }
}

function Cover({
    track,
    size,
}: {
    track: { title: string; artist: string }
    size: CoverSize
}) {
    const p = PALETTES[hash(track.title + '|' + track.artist) % PALETTES.length]
    const c = coverStyles(p, size)
    return (
        <div style={c.surf}>
            <div style={c.artistS}>{track.artist}</div>
            <div style={c.titleS}>{track.title}</div>
        </div>
    )
}

// ---- popularity ----
function tier(pop: number): 'BAIXA' | 'MÉDIA' | 'ALTA' {
    return pop < 34 ? 'BAIXA' : pop < 67 ? 'MÉDIA' : 'ALTA'
}

type Badge = {
    tier: string
    text: string
    hint: string
    style: CSSProperties
    multColor: string
}

function badge(pop: number): Badge {
    const t = tier(pop)
    const base: CSSProperties = {
        fontFamily: 'var(--font-jetbrains), ui-monospace, monospace',
        fontSize: '9.5px',
        fontWeight: 700,
        letterSpacing: '.1em',
        padding: '4px 9px',
        borderRadius: '4px',
        flex: 'none',
        whiteSpace: 'nowrap',
    }
    if (t === 'BAIXA')
        return {
            tier: t,
            text: 'ACHADO RARO',
            hint: 'mult. alto',
            style: {
                ...base,
                background: 'rgba(205,239,54,.16)',
                color: '#cdef36',
                border: '1px solid rgba(205,239,54,.4)',
            },
            multColor: '#cdef36',
        }
    if (t === 'MÉDIA')
        return {
            tier: t,
            text: 'SUBINDO',
            hint: 'mult. médio',
            style: {
                ...base,
                background: 'rgba(236,227,210,.1)',
                color: 'rgba(236,227,210,.82)',
                border: '1px solid rgba(236,227,210,.22)',
            },
            multColor: '#cdef36',
        }
    return {
        tier: t,
        text: 'NA BOCA DO POVO',
        hint: 'mult. baixo',
        style: {
            ...base,
            background: 'transparent',
            color: 'rgba(236,227,210,.5)',
            border: '1px solid rgba(236,227,210,.18)',
        },
        multColor: 'rgba(236,227,210,.62)',
    }
}

function fmt(n: number): string {
    return Math.round(n).toLocaleString('pt-BR')
}

function futureDate(n: number): string {
    const d = new Date()
    d.setDate(d.getDate() + n)
    const m = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    return d.getDate() + ' ' + m[d.getMonth()]
}

// ---- data ----
const POOL: Track[] = [
    { id: 't1', title: 'stray', artist: 'meat computer', pop: 16, mult: 'x3,4', cravando: 23 },
    { id: 't2', title: 'XVI', artist: 'akiaura, LONOWN', pop: 27, mult: 'x3,1', cravando: 41 },
    { id: 't3', title: 'Daydream', artist: 'Hiko Momoji', pop: 31, mult: 'x2,8', cravando: 58 },
    { id: 't4', title: 'Make Love', artist: 'Daft Punk', pop: 44, mult: 'x2,4', cravando: 120 },
    { id: 't5', title: '7K', artist: 'Yung Buda, Baby Gengar', pop: 55, mult: 'x2,0', cravando: 188 },
    { id: 't6', title: 'Feel Ur Love', artist: 'Emma Louise, Flume', pop: 64, mult: 'x1,8', cravando: 305 },
    { id: 't7', title: 'PIXELATED KISSES', artist: 'Joji', pop: 74, mult: 'x1,5', cravando: 612 },
]

function defaultSlots(): (Slot | null)[] {
    return [
        {
            id: 'stray',
            title: 'stray',
            artist: 'meat computer',
            pop: 18,
            mult: 'x3,4',
            cravando: 35,
            delta: '+12 desde você cravou',
            daysLeft: 4,
            recolherDate: '25 jun',
            status: 'travada',
        },
        {
            id: 'black',
            title: 'Black',
            artist: 'Yung Buda',
            pop: 58,
            mult: 'x2,6',
            cravando: 240,
            delta: '+52 desde você cravou',
            status: 'livre',
        },
        null,
    ]
}

const monoFont = 'font-mono'

export default function CravadasContent() {
    const [slots, setSlots] = useState<(Slot | null)[]>(defaultSlots)
    const [modalSlot, setModalSlot] = useState<number | null>(null)
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState<string | null>(null)
    const [open, setOpen] = useState<Record<number, boolean>>({})

    const isOpen = (i: number) => (open[i] !== undefined ? open[i] : START_EXPANDED)

    // ---- actions ----
    const openModal = (i: number) => {
        setModalSlot(i)
        setQuery('')
        setSelected(null)
    }
    const closeModal = () => {
        setModalSlot(null)
        setQuery('')
        setSelected(null)
    }
    const toggleInfo = (i: number) =>
        setOpen((prev) => ({ ...prev, [i]: !isOpen(i) }))
    const recolher = (i: number) => {
        setSlots((prev) => {
            const next = prev.slice()
            next[i] = null
            return next
        })
        setOpen((prev) => ({ ...prev, [i]: false }))
    }
    const fillSlot = (t: Track) => {
        if (modalSlot == null) return
        const i = modalSlot
        setSlots((prev) => {
            const next = prev.slice()
            next[i] = {
                id: 's-' + t.id,
                title: t.title,
                artist: t.artist,
                pop: t.pop,
                mult: t.mult,
                cravando: t.cravando + 1,
                delta: 'você acabou de cravar',
                daysLeft: LOCK_DAYS,
                recolherDate: futureDate(LOCK_DAYS),
                status: 'travada',
            }
            return next
        })
        closeModal()
    }

    // ---- derived (modal) ----
    const q = query.trim().toLowerCase()
    const results = q
        ? POOL.filter((t) => (t.title + ' ' + t.artist).toLowerCase().includes(q))
        : []
    const sel = selected ? POOL.find((t) => t.id === selected) ?? null : null
    const used = slots.filter(Boolean).length

    const modalOpen = modalSlot != null
    const searchView = modalOpen && !sel
    const detailView = modalOpen && !!sel

    return (
        <>
            {/* HERO */}
            <section>
                <div className="mx-auto max-w-[1200px] px-5 pb-6 pt-14 sm:px-8">
                    <div className="mb-4 font-mono text-[11px] tracking-[0.2em] text-mir-acc">
                        CRAVE A FAIXA ANTES DELA BOMBAR
                    </div>
                    <div className="flex flex-wrap items-end gap-6">
                        <h1 className="m-0 text-[clamp(64px,9vw,116px)] font-black leading-[0.82] tracking-[-0.055em]">
                            Cravadas
                        </h1>
                        <p className="m-0 mb-3 max-w-[440px] text-[18px] leading-[1.45] text-mir-text2">
                            Você tem{' '}
                            <b className="font-bold text-mir-text">
                                {3 - used} {3 - used === 1 ? 'vaga' : 'vagas'}
                            </b>{' '}
                            pra cravar faixas que acha que vão subir. Quanto mais
                            escondida a faixa, maior o multiplicador. Seu faro,
                            em jogo.
                        </p>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-[18px] font-mono text-[11px] tracking-[0.12em] text-mir-text2/80">
                        <span className="flex items-center gap-2">
                            <span className="anim-blink h-2 w-2 rounded-full bg-mir-acc" />
                            {used} DE 3 VAGAS EM JOGO
                        </span>
                        <span className="opacity-40">·</span>
                        <span>TRAVA DE {LOCK_DAYS} DIAS</span>
                    </div>
                </div>
            </section>

            {/* 3 SLOTS */}
            <section>
                <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-6 sm:px-8">
                    <div className="grid grid-cols-1 items-start gap-[18px] md:grid-cols-3">
                        {slots.map((s, i) => {
                            const vaga = '0' + (i + 1)

                            if (!s) {
                                return (
                                    <div
                                        key={i}
                                        className="flex min-w-0 rounded-2xl border-[1.5px] border-dashed border-mir-acc/30 bg-mir-acc/[0.03]"
                                    >
                                        <button
                                            onClick={() => openModal(i)}
                                            className="flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 border-none bg-transparent p-[26px] text-center text-inherit"
                                        >
                                            <div className="mb-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border-[1.5px] border-mir-acc/50 text-[34px] font-light leading-[0] text-mir-acc">
                                                +
                                            </div>
                                            <div className="font-mono text-[11px] tracking-[0.16em] text-mir-text2/70">
                                                VAGA {vaga} · LIVRE
                                            </div>
                                            <div className="mt-0.5 max-w-[200px] text-[21px] font-extrabold leading-[1.1] tracking-[-0.03em]">
                                                Crave uma faixa antes dela bombar
                                            </div>
                                            <span className="mt-4 inline-flex items-center gap-[7px] rounded-full bg-mir-acc px-[22px] py-[11px] text-sm font-bold text-mir-on-acc">
                                                Escolher faixa →
                                            </span>
                                        </button>
                                    </div>
                                )
                            }

                            const b = badge(s.pop)
                            const travada = s.status === 'travada'
                            const opened = isOpen(i)

                            return (
                                <div
                                    key={i}
                                    className="flex min-w-0 rounded-2xl bg-mir-surface"
                                    style={{
                                        border: travada
                                            ? '1px solid rgba(236,227,210,.12)'
                                            : '1.5px solid rgba(205,239,54,.4)',
                                        boxShadow: travada
                                            ? 'none'
                                            : '0 20px 44px -24px rgba(205,239,54,.32)',
                                    }}
                                >
                                    <div className="flex w-full flex-col p-5">
                                        <div className="mb-5 flex items-center justify-between">
                                            <span
                                                className="inline-flex items-center gap-[7px] rounded-full px-[11px] py-[5px] font-mono text-[10px] font-bold tracking-[0.12em]"
                                                style={{
                                                    background: travada
                                                        ? 'rgba(236,227,210,.06)'
                                                        : 'rgba(205,239,54,.14)',
                                                    color: travada
                                                        ? 'rgba(236,227,210,.72)'
                                                        : '#cdef36',
                                                    border: travada
                                                        ? '1px solid rgba(236,227,210,.14)'
                                                        : '1px solid rgba(205,239,54,.4)',
                                                }}
                                            >
                                                <span
                                                    className="h-[7px] w-[7px] flex-none rounded-full"
                                                    style={{
                                                        background: travada
                                                            ? '#e0a84a'
                                                            : '#cdef36',
                                                    }}
                                                />
                                                {travada
                                                    ? 'TRAVADA · ' + s.daysLeft + 'D'
                                                    : 'LIVRE PRA RECOLHER'}
                                            </span>
                                            <span className="font-mono text-[10px] tracking-[0.16em] text-mir-text2/[0.32]">
                                                VAGA {vaga}
                                            </span>
                                        </div>

                                        <div className="mb-6 flex items-center gap-[15px]">
                                            <div className="relative h-[62px] w-[62px] flex-none overflow-hidden rounded-md shadow-[0_10px_20px_-12px_rgba(0,0,0,.7)]">
                                                <Cover track={s} size="slot" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[22px] font-extrabold leading-[1.05] tracking-[-0.025em]">
                                                    {s.title}
                                                </div>
                                                <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-mir-text2/80">
                                                    {s.artist}
                                                </div>
                                            </div>
                                        </div>

                                        {/* action */}
                                        {travada ? (
                                            <>
                                                <button
                                                    disabled
                                                    className="h-11 w-full cursor-not-allowed rounded-full border border-mir-line2/80 bg-mir-fill1 text-sm font-bold text-mir-text2"
                                                >
                                                    Travada · {s.daysLeft} dias
                                                    restantes
                                                </button>
                                                <div className="mt-[9px] text-center font-mono text-[10px] tracking-[0.04em] text-mir-text2/[0.55]">
                                                    Recolher liberado em{' '}
                                                    {s.recolherDate}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex gap-[9px]">
                                                    <button
                                                        onClick={() => recolher(i)}
                                                        className="h-11 flex-1 cursor-pointer rounded-full border-none bg-mir-acc text-sm font-bold text-mir-on-acc"
                                                    >
                                                        Recolher
                                                    </button>
                                                    <button className="h-11 flex-none cursor-pointer rounded-full border border-mir-line2 bg-transparent px-4 text-[13px] font-semibold text-mir-text/75">
                                                        Deixar correndo
                                                    </button>
                                                </div>
                                                <div className="mt-[9px] text-center font-mono text-[10px] tracking-[0.04em] text-mir-text2/[0.55]">
                                                    Trava cumprida · recolha
                                                    quando quiser
                                                </div>
                                            </>
                                        )}

                                        {/* ver infos toggle */}
                                        <button
                                            onClick={() => toggleInfo(i)}
                                            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-[7px] border-none border-t border-t-mir-line bg-transparent pt-3.5 font-mono text-[10.5px] tracking-[0.1em] text-mir-text2/80"
                                        >
                                            {opened
                                                ? 'esconder infos da cravada ⌃'
                                                : 'ver infos da cravada ⌄'}
                                        </button>

                                        {opened && (
                                            <div className="anim-slide mt-3.5 flex flex-col gap-3.5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="mb-[5px] font-mono text-[9.5px] tracking-[0.14em] text-mir-text2/[0.66]">
                                                            MULTIPLICADOR CRAVADO
                                                        </div>
                                                        <div className="text-[34px] font-black leading-[0.85] tracking-[-0.04em] text-mir-acc">
                                                            {s.mult}
                                                        </div>
                                                    </div>
                                                    <span style={b.style}>
                                                        {b.text}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="mb-1.5 flex justify-between font-mono text-[9.5px] tracking-[0.1em] text-mir-text2/[0.7]">
                                                        <span>
                                                            POPULARIDADE QUANDO
                                                            CRAVOU
                                                        </span>
                                                        <span>{b.hint}</span>
                                                    </div>
                                                    <div className="h-1 overflow-hidden rounded-sm bg-mir-text2/20">
                                                        <div
                                                            className="h-full rounded-sm bg-mir-text2/[0.9]"
                                                            style={{
                                                                width: s.pop + '%',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="font-mono text-[11px] leading-[1.45] text-mir-text2/[0.9]">
                                                    {fmt(s.cravando)} pessoas
                                                    cravaram · {s.delta}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* MODAL */}
            {modalOpen && (
                <div
                    onClick={closeModal}
                    className="anim-fade fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-[rgba(8,6,3,0.72)] px-5 py-12 backdrop-blur-md"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="anim-pop w-full max-w-[560px] overflow-hidden rounded-[18px] border border-mir-line2/80 bg-[#1c160e] shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)]"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-mir-line px-6 py-[22px]">
                            <div>
                                <div className="mb-[7px] font-mono text-[10px] tracking-[0.18em] text-mir-acc">
                                    CRAVAR NA VAGA{' '}
                                    {modalSlot != null ? '0' + (modalSlot + 1) : ''}
                                </div>
                                <h3 className="m-0 text-[25px] font-black tracking-[-0.035em]">
                                    {sel ? 'Confira e crave' : 'Buscar faixa'}
                                </h3>
                            </div>
                            <button
                                onClick={closeModal}
                                className="flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-full border border-mir-line2 bg-transparent text-base leading-[0] text-mir-text/70"
                            >
                                ✕
                            </button>
                        </div>

                        {/* SEARCH VIEW */}
                        {searchView && (
                            <>
                                <div className="px-6 pb-2 pt-[18px]">
                                    <div className="flex items-center gap-2.5 rounded-full border border-mir-line2/90 bg-[#211a11] px-[18px] py-[13px]">
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="rgba(236,227,210,.55)"
                                            strokeWidth="2"
                                        >
                                            <circle cx="11" cy="11" r="7" />
                                            <path d="M21 21l-4-4" />
                                        </svg>
                                        <input
                                            value={query}
                                            onChange={(e) =>
                                                setQuery(e.target.value)
                                            }
                                            autoFocus
                                            placeholder="Buscar a faixa que você quer cravar"
                                            className="w-full border-none bg-transparent font-mono text-[13px] text-mir-text outline-none placeholder:text-mir-text3"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-[48vh] overflow-y-auto px-3 pb-3.5 pt-1.5">
                                    {!q && (
                                        <div className="px-6 py-12 text-center font-mono text-[12px] leading-[1.7] text-mir-text2/[0.66]">
                                            Comece a digitar pra encontrar
                                            <br />a faixa. Você vê as infos dela
                                            <br />
                                            antes de confirmar a cravada.
                                        </div>
                                    )}
                                    {results.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => setSelected(r.id)}
                                            className="flex w-full cursor-pointer items-center gap-3.5 rounded-[10px] border-none border-b border-b-mir-line bg-transparent px-3.5 py-3 text-left text-inherit"
                                        >
                                            <div className="relative h-[46px] w-[46px] flex-none overflow-hidden rounded-[5px]">
                                                <Cover track={r} size="row" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold tracking-[-0.02em]">
                                                    {r.title}
                                                </div>
                                                <div className="mt-[3px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-mir-text2/[0.8]">
                                                    {r.artist}
                                                </div>
                                            </div>
                                            <span className="flex-none text-lg text-mir-text2/[0.66]">
                                                →
                                            </span>
                                        </button>
                                    ))}
                                    {!!q && results.length === 0 && (
                                        <div className="px-5 py-10 text-center font-mono text-[12px] text-mir-text2/[0.66]">
                                            Nenhuma faixa encontrada pra &quot;
                                            {query}&quot;.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* DETAIL VIEW */}
                        {detailView && sel && (
                            <DetailView
                                track={sel}
                                onBack={() => setSelected(null)}
                                onConfirm={() => fillSlot(sel)}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

function DetailView({
    track,
    onBack,
    onConfirm,
}: {
    track: Track
    onBack: () => void
    onConfirm: () => void
}) {
    const b = badge(track.pop)
    return (
        <div className="anim-slide px-6 pb-6 pt-5">
            <button
                onClick={onBack}
                className={`mb-[18px] cursor-pointer border-none bg-transparent p-0 ${monoFont} text-[11px] tracking-[0.1em] text-mir-text2/[0.7]`}
            >
                ← buscar outra
            </button>

            <div className="mb-[22px] flex items-center gap-4">
                <div className="relative h-[76px] w-[76px] flex-none overflow-hidden rounded-lg shadow-[0_14px_28px_-14px_rgba(0,0,0,.7)]">
                    <Cover track={track} size="big" />
                </div>
                <div className="min-w-0">
                    <div className="text-[26px] font-black leading-[1.02] tracking-[-0.03em]">
                        {track.title}
                    </div>
                    <div className="mt-[5px] font-mono text-[12px] text-mir-text2/[0.7]">
                        {track.artist}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-mir-line bg-[#211a11] p-5">
                <div className="mb-[18px] flex items-start justify-between gap-3">
                    <div>
                        <div className="mb-1.5 font-mono text-[9.5px] tracking-[0.14em] text-mir-text2/[0.7]">
                            MULTIPLICADOR SE CRAVAR AGORA
                        </div>
                        <div
                            className="text-[46px] font-black leading-[0.82] tracking-[-0.04em]"
                            style={{ color: b.multColor }}
                        >
                            {track.mult}
                        </div>
                    </div>
                    <span style={b.style}>{b.text}</span>
                </div>
                <div className="mb-4">
                    <div className="mb-1.5 flex justify-between font-mono text-[9.5px] tracking-[0.1em] text-mir-text2/[0.7]">
                        <span>POPULARIDADE</span>
                        <span>{b.hint}</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-sm bg-mir-text2/20">
                        <div
                            className="h-full rounded-sm bg-mir-text2/[0.8]"
                            style={{ width: track.pop + '%' }}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-[9px] border-t border-mir-line pt-3.5 font-mono text-[12px] text-mir-text2/[0.85]">
                    <span className="font-bold text-mir-text">
                        {fmt(track.cravando)}
                    </span>{' '}
                    pessoas já cravaram nessa faixa
                </div>
            </div>

            <div className="mx-0.5 mb-[18px] mt-4 font-mono text-[11px] leading-[1.6] text-mir-text2/[0.66]">
                A trava de {LOCK_DAYS} dias começa assim que você cravar. O
                multiplicador fica fixo no valor de agora — depois é só ver a
                faixa subir.
            </div>

            <button
                onClick={onConfirm}
                className="h-[50px] w-full cursor-pointer rounded-full border-none bg-mir-acc text-base font-extrabold tracking-[-0.01em] text-mir-on-acc"
            >
                Cravar {track.title} · {track.mult}
            </button>
        </div>
    )
}
