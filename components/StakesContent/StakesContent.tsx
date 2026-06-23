'use client'

import {
    useState,
    useEffect,
    useRef,
    useCallback,
    type CSSProperties,
} from 'react'
import { useToast } from '@/components/ui/use-toast'
import { formatMultiplier } from '@/utils/stakeMultiplier'
import { capture } from '@/lib/posthog'

// Regras da feature (ver Stake.md): 3 vagas, e só dá pra COLETAR os pontos
// depois de 7 dias. Remover antes disso é permitido, mas zera os pontos.
const MAX_SLOTS = 3
const MIN_DAYS = 7
const START_EXPANDED = false

type Palette = { bg: string; fg: string; mut: string }
type CoverSize = 'big' | 'slot' | 'row'

// Stake vindo do backend (GET /stakes)
type Stake = {
    id: string
    track_id: string
    track_uri: string
    track_title: string
    artist_name: string
    artist_id: string | null
    album_name: string | null
    track_thumbnail: string | null
    baseline_popularity: number
    artist_popularity: number
    multiplier: number | string
    accumulated_points: number
    last_popularity: number
    last_day_gain: number
    status: 'ativa' | 'removida' | 'coletada'
    staked_at: string
    days_held: number
    days_to_collect: number
    can_collect: boolean
    pessoas_deram_stake: number
}

// Resultado de busca do Spotify mapeado para a UI
type SearchTrack = {
    id: string
    title: string
    artist: string
    uri: string
    isrc: string | null
    albumName: string | null
    thumbnail: string | null
    cover: string | null
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
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
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
        fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
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

const monoFont = 'font-mono'

function mapSearchTrack(t: {
    id: string
    name: string
    uri: string
    external_ids?: { isrc?: string }
    artists?: { name: string }[]
    album?: { name?: string; images?: { url: string }[] }
}): SearchTrack {
    const artists = t.artists ?? []
    const images = t.album?.images ?? []
    return {
        id: t.id,
        title: t.name,
        artist: artists.map((a) => a.name).join(', ') || '—',
        uri: t.uri,
        isrc: t.external_ids?.isrc ?? null,
        albumName: t.album?.name ?? null,
        // imagem menor (última) costuma ser ~64px, ideal para os covers da lista
        thumbnail: images[images.length - 1]?.url ?? images[0]?.url ?? null,
        // imagem maior (primeira) costuma ser ~640px, pro hero em destaque
        cover: images[0]?.url ?? images[images.length - 1]?.url ?? null,
    }
}

// Mostra a capa real (Spotify) quando existe; senão cai no cover gerado.
function CoverImage({
    src,
    track,
    size,
}: {
    src: string | null
    track: { title: string; artist: string }
    size: CoverSize
}) {
    if (src) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={track.title}
                className="absolute inset-0 h-full w-full object-cover"
            />
        )
    }
    return <Cover track={track} size={size} />
}

export default function StakesContent() {
    const [stakes, setStakes] = useState<Stake[]>([])
    const [loading, setLoading] = useState(true)
    const [points, setPoints] = useState<number | null>(null)

    const [modalSlot, setModalSlot] = useState<number | null>(null)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchTrack[]>([])
    const [searching, setSearching] = useState(false)
    const [selected, setSelected] = useState<SearchTrack | null>(null)
    const [previewMult, setPreviewMult] = useState<number | null>(null)
    const [previewPop, setPreviewPop] = useState<number | null>(null)
    const [previewing, setPreviewing] = useState(false)
    const [staking, setStaking] = useState(false)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [open, setOpen] = useState<Record<string, boolean>>({})

    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const { toast } = useToast()

    // ---- carregar stakes + total de pontos ----
    const loadStakes = useCallback(async () => {
        try {
            const res = await fetch('/api/stakes', { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setStakes(Array.isArray(data.stakes) ? data.stakes : [])
            } else {
                setStakes([])
            }
        } catch {
            setStakes([])
        } finally {
            setLoading(false)
        }
    }, [])

    const loadPoints = useCallback(async () => {
        try {
            const res = await fetch('/api/stakes/points', { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setPoints(typeof data.total === 'number' ? data.total : 0)
            }
        } catch {
            // silencioso — o total é secundário
        }
    }, [])

    useEffect(() => {
        loadStakes()
        loadPoints()
    }, [loadStakes, loadPoints])

    // ---- busca no Spotify (debounce) ----
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current)
        const q = query.trim()
        if (q.length < 2) {
            setResults([])
            setSearching(false)
            return
        }
        setSearching(true)
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(q)}&limit=10&type=track`
                )
                if (res.ok) {
                    const data = await res.json()
                    const items = (data.tracks?.items ?? []).map(mapSearchTrack)
                    setResults(items)
                } else {
                    setResults([])
                }
            } catch {
                setResults([])
            } finally {
                setSearching(false)
            }
        }, 300)
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current)
        }
    }, [query])

    // ---- ações ----
    const isOpen = (id: string) => (open[id] !== undefined ? open[id] : START_EXPANDED)
    const toggleInfo = (id: string) =>
        setOpen((prev) => ({ ...prev, [id]: !isOpen(id) }))

    const resetPreview = () => {
        setSelected(null)
        setPreviewMult(null)
        setPreviewPop(null)
    }
    const openModal = (i: number) => {
        setModalSlot(i)
        setQuery('')
        setResults([])
        resetPreview()
        capture('stake_modal_opened', { slot: i + 1 })
    }
    const closeModal = () => {
        setModalSlot(null)
        setQuery('')
        setResults([])
        resetPreview()
    }

    const selectTrack = async (t: SearchTrack) => {
        setSelected(t)
        setPreviewMult(null)
        setPreviewPop(null)
        setPreviewing(true)
        try {
            const qs = new URLSearchParams({ artist: t.artist, title: t.title })
            if (t.isrc) qs.set('isrc', t.isrc)
            const res = await fetch(`/api/stakes/preview?${qs.toString()}`)
            if (res.ok) {
                const data = await res.json()
                if (data.matched) {
                    setPreviewMult(
                        typeof data.multiplier === 'number' ? data.multiplier : null
                    )
                    setPreviewPop(
                        typeof data.popularity === 'number' ? data.popularity : null
                    )
                }
            }
        } catch {
            // sem prévia: o multiplicador real é calculado ao dar stake
        } finally {
            setPreviewing(false)
        }
    }

    const placeStake = async () => {
        if (!selected || modalSlot == null) return
        setStaking(true)
        try {
            const res = await fetch('/api/stakes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: selected.id,
                    trackUri: selected.uri,
                    trackTitle: selected.title,
                    artistName: selected.artist,
                    albumName: selected.albumName ?? undefined,
                    trackThumbnail: selected.thumbnail ?? undefined,
                    isrc: selected.isrc ?? undefined,
                }),
            })
            const data = await res.json()
            if (res.ok && data.stake) {
                capture('stake_placed', {
                    slot: modalSlot + 1,
                    track_id: selected.id,
                    track_title: selected.title,
                    artist_name: selected.artist,
                    multiplier: Number(data.stake.multiplier),
                    popularity: previewPop,
                })
                toast({
                    title: 'Stake feito!',
                    description: `"${selected.title}" · multiplicador ${formatMultiplier(
                        Number(data.stake.multiplier)
                    )}`,
                })
                await loadStakes()
                closeModal()
            } else {
                capture('stake_failed', {
                    track_id: selected.id,
                    error: data.error ?? 'unknown',
                })
                toast({
                    title: 'Não foi possível dar stake',
                    description: data.error ?? 'Tente novamente',
                    variant: 'destructive',
                })
            }
        } catch {
            toast({
                title: 'Erro ao dar stake na faixa',
                variant: 'destructive',
            })
        } finally {
            setStaking(false)
        }
    }

    const recolher = async (c: Stake) => {
        setBusyId(c.id)
        try {
            const res = await fetch(`/api/stakes/${c.id}/recolher`, {
                method: 'POST',
            })
            const data = await res.json()
            if (res.ok) {
                capture('stake_collected', {
                    stake_id: c.id,
                    track_id: c.track_id,
                    track_title: c.track_title,
                    artist_name: c.artist_name,
                    collected: !!data.collected,
                    points: data.collected ? data.points : 0,
                    days_held: c.days_held,
                    status: c.status,
                })
                if (data.collected) {
                    toast({
                        title: 'Recolhido!',
                        description: `+${fmt(data.points)} pontos pra sua conta`,
                    })
                } else {
                    toast({ description: 'Vaga liberada' })
                }
                setOpen((prev) => ({ ...prev, [c.id]: false }))
                await Promise.all([loadStakes(), loadPoints()])
            } else {
                toast({
                    title: 'Erro ao recolher',
                    description: data.error ?? 'Tente novamente',
                    variant: 'destructive',
                })
            }
        } catch {
            toast({ title: 'Erro ao recolher', variant: 'destructive' })
        } finally {
            setBusyId(null)
        }
    }

    // ---- derived ----
    const slots: (Stake | null)[] = [0, 1, 2].map((i) => stakes[i] ?? null)
    const used = Math.min(stakes.length, MAX_SLOTS)

    const modalOpen = modalSlot != null
    const searchView = modalOpen && !selected
    const detailView = modalOpen && !!selected

    return (
        <>
            {/* HERO */}
            <section>
                <div className="mx-auto max-w-[1200px] px-5 pb-6 pt-14 sm:px-8">
                    <div className="mb-4 font-mono text-[11px] tracking-[0.2em] text-mir-acc">
                        DÊ STAKE NA FAIXA ANTES DELA BOMBAR
                    </div>
                    <div className="flex flex-wrap items-end gap-6">
                        <h1 className="m-0 text-[clamp(64px,9vw,116px)] font-black leading-[0.82] tracking-[-0.055em]">
                            Stakes
                        </h1>
                        <p className="m-0 mb-3 max-w-[440px] text-[18px] leading-[1.45] text-mir-text2">
                            Você tem{' '}
                            <b className="font-bold text-mir-text">
                                {MAX_SLOTS - used}{' '}
                                {MAX_SLOTS - used === 1 ? 'vaga' : 'vagas'}
                            </b>{' '}
                            pra dar stake em faixas que acha que vão subir. Quanto
                            mais escondida a faixa, maior o multiplicador. Seu faro,
                            em jogo.
                        </p>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-[18px] font-mono text-[11px] tracking-[0.12em] text-mir-text2/80">
                        <span className="flex items-center gap-2">
                            <span className="anim-blink h-2 w-2 rounded-full bg-mir-acc" />
                            {used} DE {MAX_SLOTS} VAGAS EM JOGO
                        </span>
                        <span className="opacity-40">·</span>
                        <span>COLETA LIBERA EM {MIN_DAYS} DIAS</span>
                        {points != null && (
                            <>
                                <span className="opacity-40">·</span>
                                <span>{fmt(points)} PONTOS RECOLHIDOS</span>
                            </>
                        )}
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
                                            disabled={loading}
                                            className="flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 border-none bg-transparent p-[26px] text-center text-inherit disabled:opacity-50"
                                        >
                                            <div className="mb-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border-[1.5px] border-mir-acc/50 text-[34px] font-light leading-[0] text-mir-acc">
                                                +
                                            </div>
                                            <div className="font-mono text-[11px] tracking-[0.16em] text-mir-text2/70">
                                                VAGA {vaga} · LIVRE
                                            </div>
                                            <div className="mt-0.5 max-w-[200px] text-[21px] font-extrabold leading-[1.1] tracking-[-0.03em]">
                                                Dê stake numa faixa antes dela bombar
                                            </div>
                                            <span className="mt-4 inline-flex items-center gap-[7px] rounded-full bg-mir-acc px-[22px] py-[11px] text-sm font-bold text-mir-on-acc">
                                                {loading ? 'Carregando…' : 'Escolher faixa →'}
                                            </span>
                                        </button>
                                    </div>
                                )
                            }

                            const removida = s.status === 'removida'
                            const podeColetar = s.can_collect
                            const b = badge(s.baseline_popularity)
                            const opened = isOpen(s.id)
                            const mult = Number(s.multiplier)
                            const busy = busyId === s.id

                            // estilo da borda: removida = apagado, livre = destaque, segurando = neutro
                            const border = removida
                                ? '1px solid rgba(236,227,210,.08)'
                                : podeColetar
                                  ? '1.5px solid rgba(205,239,54,.4)'
                                  : '1px solid rgba(236,227,210,.12)'
                            const shadow =
                                !removida && podeColetar
                                    ? '0 20px 44px -24px rgba(205,239,54,.32)'
                                    : 'none'

                            return (
                                <div
                                    key={s.id}
                                    className="flex min-w-0 rounded-2xl bg-mir-surface"
                                    style={{
                                        border,
                                        boxShadow: shadow,
                                        opacity: removida ? 0.55 : 1,
                                    }}
                                >
                                    <div className="flex w-full flex-col p-5">
                                        <div className="mb-5 flex items-center justify-between">
                                            <span
                                                className="inline-flex items-center gap-[7px] rounded-full px-[11px] py-[5px] font-mono text-[10px] font-bold tracking-[0.12em]"
                                                style={{
                                                    background: removida
                                                        ? 'rgba(236,227,210,.05)'
                                                        : podeColetar
                                                          ? 'rgba(205,239,54,.14)'
                                                          : 'rgba(236,227,210,.06)',
                                                    color: removida
                                                        ? 'rgba(236,227,210,.5)'
                                                        : podeColetar
                                                          ? '#cdef36'
                                                          : 'rgba(236,227,210,.72)',
                                                    border: removida
                                                        ? '1px solid rgba(236,227,210,.12)'
                                                        : podeColetar
                                                          ? '1px solid rgba(205,239,54,.4)'
                                                          : '1px solid rgba(236,227,210,.14)',
                                                }}
                                            >
                                                <span
                                                    className="h-[7px] w-[7px] flex-none rounded-full"
                                                    style={{
                                                        background: removida
                                                            ? '#8a8175'
                                                            : podeColetar
                                                              ? '#cdef36'
                                                              : '#e0a84a',
                                                    }}
                                                />
                                                {removida
                                                    ? 'REMOVIDA DO SPOTIFY'
                                                    : podeColetar
                                                      ? 'LIVRE PRA RECOLHER'
                                                      : 'SEGURANDO · ' + s.days_held + 'D'}
                                            </span>
                                            <span className="font-mono text-[10px] tracking-[0.16em] text-mir-text2/[0.32]">
                                                VAGA {vaga}
                                            </span>
                                        </div>

                                        <div className="mb-6 flex items-center gap-[15px]">
                                            <div
                                                className="relative h-[62px] w-[62px] flex-none overflow-hidden rounded-md shadow-[0_10px_20px_-12px_rgba(0,0,0,.7)]"
                                                style={{
                                                    filter: removida
                                                        ? 'grayscale(1)'
                                                        : 'none',
                                                }}
                                            >
                                                <CoverImage
                                                    src={s.track_thumbnail}
                                                    track={{
                                                        title: s.track_title,
                                                        artist: s.artist_name,
                                                    }}
                                                    size="slot"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[22px] font-extrabold leading-[1.05] tracking-[-0.025em]">
                                                        {s.track_title}
                                                    </div>
                                                    {!removida && s.last_day_gain > 0 && (
                                                        <span className="flex-none rounded-full bg-mir-acc/15 px-2 py-[3px] font-mono text-[10px] font-bold text-mir-acc">
                                                            +{fmt(s.last_day_gain)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-mir-text2/80">
                                                    {s.artist_name}
                                                </div>
                                            </div>
                                        </div>

                                        {/* action */}
                                        {removida ? (
                                            <>
                                                <button
                                                    onClick={() => recolher(s)}
                                                    disabled={busy}
                                                    className="h-11 w-full cursor-pointer rounded-full border border-mir-line2 bg-transparent text-sm font-bold text-mir-text/75 disabled:opacity-50"
                                                >
                                                    {busy ? 'Esvaziando…' : 'Esvaziar vaga'}
                                                </button>
                                                <div className="mt-[9px] text-center font-mono text-[10px] tracking-[0.04em] text-mir-text2/[0.55]">
                                                    Faixa saiu do Spotify · não vale mais
                                                </div>
                                            </>
                                        ) : podeColetar ? (
                                            <>
                                                <div className="flex gap-[9px]">
                                                    <button
                                                        onClick={() => recolher(s)}
                                                        disabled={busy}
                                                        className="h-11 flex-1 cursor-pointer rounded-full border-none bg-mir-acc text-sm font-bold text-mir-on-acc disabled:opacity-60"
                                                    >
                                                        {busy
                                                            ? 'Recolhendo…'
                                                            : 'Recolher · ' +
                                                              fmt(s.accumulated_points) +
                                                              ' pts'}
                                                    </button>
                                                </div>
                                                <div className="mt-[9px] text-center font-mono text-[10px] tracking-[0.04em] text-mir-text2/[0.55]">
                                                    Trava cumprida · recolha quando quiser
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    disabled
                                                    className="h-11 w-full cursor-not-allowed rounded-full border border-mir-line2/80 bg-mir-fill1 text-sm font-bold text-mir-text2"
                                                >
                                                    {s.accumulated_points > 0
                                                        ? fmt(s.accumulated_points) +
                                                          ' pts acumulados'
                                                        : 'Acumulando pontos…'}
                                                </button>
                                                <div className="mt-[9px] flex items-center justify-center gap-2 text-center font-mono text-[10px] tracking-[0.04em] text-mir-text2/[0.55]">
                                                    <span>
                                                        Recolher libera em{' '}
                                                        {s.days_to_collect}{' '}
                                                        {s.days_to_collect === 1
                                                            ? 'dia'
                                                            : 'dias'}
                                                    </span>
                                                    <span className="opacity-40">·</span>
                                                    <button
                                                        onClick={() => recolher(s)}
                                                        disabled={busy}
                                                        className="cursor-pointer border-none bg-transparent p-0 font-mono text-[10px] tracking-[0.04em] text-mir-text2/[0.55] underline disabled:opacity-50"
                                                    >
                                                        {busy ? 'removendo…' : 'remover assim mesmo'}
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* ver infos toggle */}
                                        <button
                                            onClick={() => toggleInfo(s.id)}
                                            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-[7px] border-none border-t border-t-mir-line bg-transparent pt-3.5 font-mono text-[10.5px] tracking-[0.1em] text-mir-text2/80"
                                        >
                                            {opened
                                                ? 'esconder infos do stake ⌃'
                                                : 'ver infos do stake ⌄'}
                                        </button>

                                        {opened && (
                                            <div className="anim-slide mt-3.5 flex flex-col gap-3.5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="mb-[5px] font-mono text-[9.5px] tracking-[0.14em] text-mir-text2/[0.66]">
                                                            MULTIPLICADOR DO STAKE
                                                        </div>
                                                        <div className="text-[34px] font-black leading-[0.85] tracking-[-0.04em] text-mir-acc">
                                                            {formatMultiplier(mult)}
                                                        </div>
                                                    </div>
                                                    <span style={b.style}>
                                                        {b.text}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="mb-1.5 flex justify-between font-mono text-[9.5px] tracking-[0.1em] text-mir-text2/[0.7]">
                                                        <span>
                                                            POPULARIDADE QUANDO DEU STAKE
                                                        </span>
                                                        <span>
                                                            agora {s.last_popularity}
                                                        </span>
                                                    </div>
                                                    <div className="h-1 overflow-hidden rounded-sm bg-mir-text2/20">
                                                        <div
                                                            className="h-full rounded-sm bg-mir-text2/[0.9]"
                                                            style={{
                                                                width:
                                                                    s.baseline_popularity +
                                                                    '%',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="font-mono text-[11px] leading-[1.45] text-mir-text2/[0.9]">
                                                    {fmt(s.pessoas_deram_stake)}{' '}
                                                    {s.pessoas_deram_stake === 1
                                                        ? 'pessoa deu stake'
                                                        : 'pessoas deram stake'}{' '}
                                                    · {fmt(s.accumulated_points)} pontos
                                                    acumulados
                                                    {!removida && s.last_day_gain > 0
                                                        ? ` · +${fmt(s.last_day_gain)} na última medição`
                                                        : ''}
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
                    className="anim-fade fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[rgba(8,6,3,0.72)] px-5 py-12 backdrop-blur-md"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="anim-pop w-full max-w-[560px] overflow-hidden rounded-[18px] border border-mir-line2/80 bg-[#1c160e] shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)]"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-mir-line px-6 py-[22px]">
                            <div>
                                <div className="mb-[7px] font-mono text-[10px] tracking-[0.18em] text-mir-acc">
                                    DAR STAKE NA VAGA{' '}
                                    {modalSlot != null ? '0' + (modalSlot + 1) : ''}
                                </div>
                                <h3 className="m-0 text-[25px] font-black tracking-[-0.035em]">
                                    {selected ? 'Confira e dê stake' : 'Buscar faixa'}
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
                                            onChange={(e) => setQuery(e.target.value)}
                                            autoFocus
                                            placeholder="Buscar a faixa que você quer dar stake"
                                            className="w-full border-none bg-transparent font-mono text-[13px] text-mir-text outline-none placeholder:text-mir-text3"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-[48vh] overflow-y-auto px-3 pb-3.5 pt-1.5">
                                    {query.trim().length < 2 && (
                                        <div className="px-6 py-12 text-center font-mono text-[12px] leading-[1.7] text-mir-text2/[0.66]">
                                            Comece a digitar pra encontrar
                                            <br />a faixa. Você vê as infos dela
                                            <br />
                                            antes de confirmar o stake.
                                        </div>
                                    )}
                                    {searching && (
                                        <div className="px-6 py-8 text-center font-mono text-[12px] text-mir-text2/[0.66]">
                                            Buscando…
                                        </div>
                                    )}
                                    {!searching &&
                                        results.map((r) => (
                                            <button
                                                key={r.id}
                                                onClick={() => selectTrack(r)}
                                                className="flex w-full cursor-pointer items-center gap-4 rounded-[10px] border-none border-b border-b-mir-line bg-transparent px-3.5 py-[14px] text-left text-inherit"
                                            >
                                                <div className="relative h-[58px] w-[58px] flex-none overflow-hidden rounded-md">
                                                    <CoverImage
                                                        src={r.thumbnail}
                                                        track={r}
                                                        size="slot"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-bold tracking-[-0.02em]">
                                                        {r.title}
                                                    </div>
                                                    <div className="mt-[4px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[12px] text-mir-text2/[0.8]">
                                                        {r.artist}
                                                    </div>
                                                </div>
                                                <span className="flex-none text-lg text-mir-text2/[0.66]">
                                                    →
                                                </span>
                                            </button>
                                        ))}
                                    {!searching &&
                                        query.trim().length >= 2 &&
                                        results.length === 0 && (
                                            <div className="px-5 py-10 text-center font-mono text-[12px] text-mir-text2/[0.66]">
                                                Nenhuma faixa encontrada pra &quot;
                                                {query}&quot;.
                                            </div>
                                        )}
                                </div>
                            </>
                        )}

                        {/* DETAIL VIEW */}
                        {detailView && selected && (
                            <DetailView
                                track={selected}
                                previewMult={previewMult}
                                previewPop={previewPop}
                                previewing={previewing}
                                staking={staking}
                                onBack={resetPreview}
                                onConfirm={placeStake}
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
    previewMult,
    previewPop,
    previewing,
    staking,
    onBack,
    onConfirm,
}: {
    track: SearchTrack
    previewMult: number | null
    previewPop: number | null
    previewing: boolean
    staking: boolean
    onBack: () => void
    onConfirm: () => void
}) {
    const pop = previewPop ?? 0
    const b = badge(pop)
    const multLabel = previewing
        ? '…'
        : previewMult != null
          ? formatMultiplier(previewMult)
          : '—'
    return (
        <div className="anim-slide px-6 pb-6 pt-5">
            <button
                onClick={onBack}
                className={`mb-5 cursor-pointer border-none bg-transparent p-0 ${monoFont} text-[12px] tracking-[0.1em] text-mir-text2/[0.7]`}
            >
                ← buscar outra
            </button>

            {/* HERO — capa em destaque (estilo Shazam) */}
            <div className="flex flex-col items-center text-center">
                <div className="relative aspect-square w-[240px] max-w-full flex-none overflow-hidden rounded-2xl shadow-[0_28px_56px_-20px_rgba(0,0,0,.8)]">
                    <CoverImage src={track.cover ?? track.thumbnail} track={track} size="big" />
                </div>
                <div className="mt-5 max-w-full px-1">
                    <div className="text-[30px] font-black leading-[1.04] tracking-[-0.03em]">
                        {track.title}
                    </div>
                    <div className="mt-2 font-mono text-[14px] text-mir-text2/[0.8]">
                        {track.artist}
                    </div>
                </div>
            </div>

            {/* stats discretos — multiplicador + popularidade */}
            <div className="mt-7 flex items-stretch gap-2.5">
                <div className="flex-1 rounded-xl border border-mir-line bg-mir-fill1/40 px-4 py-3.5">
                    <div className="font-mono text-[10px] tracking-[0.12em] text-mir-text2/[0.6]">
                        MULTIPLICADOR
                    </div>
                    <div
                        className="mt-1 text-[22px] font-black leading-none tracking-[-0.03em]"
                        style={{ color: b.multColor }}
                    >
                        {multLabel}
                    </div>
                </div>
                <div className="flex-1 rounded-xl border border-mir-line bg-mir-fill1/40 px-4 py-3.5">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] tracking-[0.12em] text-mir-text2/[0.6]">
                            POPULARIDADE
                        </span>
                        <span className="font-mono text-[13px] font-bold text-mir-text">
                            {previewing ? '…' : pop}
                        </span>
                    </div>
                    <div className="mt-2.5 h-1 overflow-hidden rounded-sm bg-mir-text2/20">
                        <div
                            className="h-full rounded-sm bg-mir-text2/[0.8]"
                            style={{ width: pop + '%' }}
                        />
                    </div>
                </div>
            </div>

            <div className="mx-0.5 mb-5 mt-4 font-mono text-[12px] leading-[1.6] text-mir-text2/[0.7]">
                O multiplicador trava no valor de agora e não muda mais. A partir
                de {MIN_DAYS} dias você pode recolher os pontos — antes disso dá pra
                remover, mas zera.
            </div>

            <button
                onClick={onConfirm}
                disabled={staking || previewing}
                className="h-[52px] w-full cursor-pointer rounded-full border-none bg-mir-acc text-base font-extrabold tracking-[-0.01em] text-mir-on-acc disabled:opacity-60"
            >
                {staking ? 'Dando stake…' : `Dar stake · ${multLabel}`}
            </button>
        </div>
    )
}
