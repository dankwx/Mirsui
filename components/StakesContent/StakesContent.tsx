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
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    ChevronDown,
    Plus,
    Search,
    X,
} from 'lucide-react'
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
import StakeChartModal from './StakeChartModal'
import styles from './Stakes.module.css'

// Regras da feature (ver Stake.md): 3 fichas; a ficha rende quando a faixa bate
// o próprio recorde de popularidade (marca d'água, migration 028) e o acumulado
// nunca desce. Só dá pra COLETAR depois de 7 dias e com saldo > 0 — remover
// antes disso é permitido, mas zera.
const MAX_SLOTS = 3
const MIN_DAYS = 7
const START_EXPANDED = false

type Palette = { bg: string; fg: string; mut: string }
type CoverSize = 'big' | 'slot' | 'row'

// Stake vindo do backend (GET /stakes)
export type Stake = {
    id: string
    track_id: string
    track_uri: string
    track_title: string
    artist_name: string
    artist_id: string | null
    album_name: string | null
    track_thumbnail: string | null
    baseline_popularity: number
    peak_popularity: number
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
    // série diária pro gráfico (vem junto do GET /stakes → abre instantâneo)
    snapshots?: {
        date: string
        popularity: number
        dayGain: number
        pointsGain: number
    }[]
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
    { bg: '#f9d454', fg: '#2d230f', mut: 'rgba(45,35,15,.6)' },
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

type CoverStyles = {
    surf: CSSProperties
    artistS: CSSProperties
    titleS: CSSProperties
}

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
            fontFamily:
                "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
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

// Cores da identidade club (tokens do shell), não hex: a paleta e o tema
// escuro chegam aqui sozinhos.
type Badge = {
    tier: string
    text: string
    hint: string
    className: string
    multColor: string
}

function badge(pop: number): Badge {
    const t = tier(pop)
    if (t === 'BAIXA')
        return {
            tier: t,
            text: 'ACHADO RARO',
            hint: 'mult. alto',
            className: styles.badgeRaro,
            multColor: 'var(--club-accent-text)',
        }
    if (t === 'MÉDIA')
        return {
            tier: t,
            text: 'SUBINDO',
            hint: 'mult. médio',
            className: styles.badgeSubindo,
            multColor: 'var(--club-accent-text)',
        }
    return {
        tier: t,
        text: 'NA BOCA DO POVO',
        hint: 'mult. baixo',
        className: '',
        multColor: 'var(--club-muted)',
    }
}

function fmt(n: number): string {
    return Math.round(n).toLocaleString('pt-BR')
}

// ---- movimento / feedback ----
// A história que este bloco conta é a do RECORDE, não a da última medição.
//
// Antes ele comparava baseline → agora, e uma ficha que foi de 10 a 15 e voltou
// pra 7 estampava "Caiu 10 → 7" em laranja, com os pontos ganhos escondidos num
// subtítulo. Só que os pontos não tinham ido a lugar nenhum: `accumulated_points`
// é catraca, nunca desce. O card contava a história da popularidade enquanto o
// usuário queria a dos pontos, e a leitura de um segundo era "perdi".
//
// Com a marca d'água (migration 028) o modelo mental fica de uma linha só:
// "você ganha quando ela bate o próprio recorde". Então é o recorde que aparece
// em destaque, e a queda vira o que ela é — a distância que falta pra render de
// novo, não um prejuízo.
type Movement = {
    tone: 'record' | 'below' | 'flat'
    color: string
    arrow: string
    headline: string
    sub: string
    /** número à direita: quanto falta pro recorde, ou o quanto já subiu */
    tag: string | null
}

const ACC = 'var(--club-accent-text)'
const MUTED = 'var(--club-muted)'

/**
 * Recorde da ficha. Fichas gravadas antes da migration 028 podem vir sem o
 * campo, e o pico nunca é menor que os dois valores que já conhecemos —
 * então o máximo dos três é sempre seguro.
 */
function picoDe(s: Stake): number {
    return Math.max(
        Math.round(s.peak_popularity ?? 0),
        Math.round(s.baseline_popularity),
        Math.round(s.last_popularity)
    )
}

function movement(s: Stake, paused = false): Movement {
    const base = Math.round(s.baseline_popularity)
    const now = Math.round(s.last_popularity)
    const peak = picoDe(s)
    const pts = fmt(s.accumulated_points)
    const ptsLabel = s.accumulated_points === 1 ? 'ponto' : 'pontos'
    const guardados =
        s.accumulated_points > 0
            ? `${pts} ${ptsLabel} garantidos`
            : 'Nada rendeu ainda'

    // parou de medir: o saldo continua valendo, mas prometer "rende de novo se
    // passar de X" seria mentira — não vai passar, porque não vai ser medida
    if (paused) {
        return {
            tone: 'below',
            color: MUTED,
            arrow: '•',
            headline: `Parou de medir em ${now}`,
            sub:
                s.accumulated_points > 0
                    ? `${guardados} · o que já rendeu continua seu`
                    : 'Não chegou a render nada',
            tag: null,
        }
    }

    // no recorde agora: tudo que ela subir daqui vira ponto na hora
    if (now >= peak && peak > base) {
        return {
            tone: 'record',
            color: ACC,
            arrow: '↑',
            headline: `No recorde: ${base} → ${now}`,
            sub: `${guardados} · daqui pra cima rende na hora`,
            tag: `+${peak - base}`,
        }
    }

    // já bateu recorde e recuou: os pontos daquele pico continuam na conta
    if (peak > base) {
        return {
            tone: 'below',
            color: MUTED,
            arrow: '•',
            headline: `Recorde ${peak} · agora ${now}`,
            sub: `${guardados} · rende de novo passando de ${peak}`,
            tag: `${peak - now} pro recorde`,
        }
    }

    // nunca passou do ponto da ficha — o recorde ainda é o próprio baseline
    return {
        tone: 'flat',
        color: MUTED,
        arrow: '•',
        headline:
            now === base ? `Parada em ${now}` : `Marca ${base} · agora ${now}`,
        sub:
            s.accumulated_points > 0
                ? `${guardados} · rende de novo passando de ${base}`
                : `Rende quando passar de ${base}`,
        tag: now < base ? `${base - now} pra marca` : null,
    }
}

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

export default function StakesContent({
    initialStakes = [],
    initialPoints = null,
    initialLoadFailed = false,
}: {
    initialStakes?: Stake[]
    initialPoints?: number | null
    /** a busca no servidor falhou — diferente de "nenhuma ficha na mesa" */
    initialLoadFailed?: boolean
} = {}) {
    const [stakes, setStakes] = useState<Stake[]>(initialStakes)
    const [loadFailed, setLoadFailed] = useState(initialLoadFailed)
    const [retrying, setRetrying] = useState(false)
    // Dados já chegam do servidor (render do page.tsx), então não há "loading"
    // inicial: a lista aparece instantânea, igual ao perfil no header.
    const [loading, setLoading] = useState(false)
    const [points, setPoints] = useState<number | null>(initialPoints)

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
    const [chartStake, setChartStake] = useState<Stake | null>(null)

    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const { toast } = useToast()

    // ---- carregar stakes + total de pontos ----
    // Em falha NÃO zera a lista: antes, um 429 ou 500 virava setStakes([]) e as
    // três vagas apareciam vazias, como se as fichas do usuário tivessem sido
    // apagadas. Mantém o último estado conhecido e marca o erro.
    const loadStakes = useCallback(async () => {
        try {
            const res = await fetch('/api/stakes', { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setStakes(Array.isArray(data.stakes) ? data.stakes : [])
                setLoadFailed(false)
            } else {
                console.error('Erro ao buscar fichas:', res.status)
                setLoadFailed(true)
            }
        } catch (error) {
            console.error('Erro ao buscar fichas:', error)
            setLoadFailed(true)
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

    const retryLoad = useCallback(async () => {
        setRetrying(true)
        await Promise.all([loadStakes(), loadPoints()])
        setRetrying(false)
    }, [loadStakes, loadPoints])

    // Sem fetch na montagem: os dados iniciais vêm do servidor (page.tsx).
    // loadStakes/loadPoints ficam só pra revalidar após dar/recolher stake.

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
    const isOpen = (id: string) =>
        open[id] !== undefined ? open[id] : START_EXPANDED
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
                        typeof data.multiplier === 'number'
                            ? data.multiplier
                            : null
                    )
                    setPreviewPop(
                        typeof data.popularity === 'number'
                            ? data.popularity
                            : null
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
                    trackThumbnail:
                        selected.cover ?? selected.thumbnail ?? undefined,
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
                    title: 'Ficha na mesa!',
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
                    title: 'Não foi possível botar a ficha',
                    description: data.error ?? 'Tente novamente',
                    variant: 'destructive',
                })
            }
        } catch {
            toast({
                title: 'Erro ao botar a ficha',
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
                    toast({ description: 'Ficha de volta na mão' })
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

    // Falhou e não há nada em mão: a gente NÃO sabe o estado das fichas. Mostrar
    // "0 DE 3 NA MESA" e três vagas livres aqui seria afirmar algo falso.
    const stateUnknown = loadFailed && stakes.length === 0

    // Esc fecha a busca, como já fecha o gráfico.
    useEffect(() => {
        if (modalSlot == null) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // closeModal só zera estado; recriar o listener a cada render não muda nada
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalSlot])

    return (
        <div className={`${shellStyles.container} ${styles.page}`}>
            <header className={styles.heading}>
                <p className={styles.kicker}>Bote suas fichas antes dela bombar</p>
                <h1>Fichas</h1>
                <p className={styles.lead}>
                    {stateUnknown ? (
                        <>
                            Suas fichas não carregaram agora. Nada foi perdido:
                            o que estava na mesa continua lá.
                        </>
                    ) : (
                        <>
                            Você tem{' '}
                            <b>
                                {MAX_SLOTS - used}{' '}
                                {MAX_SLOTS - used === 1 ? 'ficha' : 'fichas'}
                            </b>{' '}
                            pra botar nas faixas que você acha que vão subir.
                            Quanto mais escondida a faixa, maior o
                            multiplicador. Seu faro, em jogo.
                        </>
                    )}
                </p>

                <p className={styles.meta}>
                    {stateUnknown ? (
                        <span>Não foi possível ler suas fichas</span>
                    ) : (
                        <>
                            <span className={styles.metaLive}>
                                <span
                                    className={styles.liveDot}
                                    aria-hidden="true"
                                />
                                <span>
                                    <b className={styles.num}>{used}</b> de{' '}
                                    <b className={styles.num}>{MAX_SLOTS}</b>{' '}
                                    fichas na mesa
                                </span>
                            </span>
                            <span className={styles.sep} aria-hidden="true">
                                ·
                            </span>
                            <span>Coleta libera em {MIN_DAYS} dias</span>
                            {points != null && (
                                <>
                                    <span
                                        className={styles.sep}
                                        aria-hidden="true"
                                    >
                                        ·
                                    </span>
                                    <span>
                                        <b className={styles.num}>
                                            {fmt(points)}
                                        </b>{' '}
                                        pontos recolhidos
                                    </span>
                                </>
                            )}
                        </>
                    )}
                </p>
            </header>

            {stateUnknown && (
                <div className={styles.failedBox}>
                    <h2>Não conseguimos carregar suas fichas</h2>
                    <p>
                        O problema é do nosso lado. As fichas que você já botou
                        seguem na mesa e os pontos continuam acumulando.
                    </p>
                    <button
                        type="button"
                        onClick={retryLoad}
                        disabled={retrying}
                        className={recipes.button}
                    >
                        {retrying ? 'Tentando…' : 'Tentar de novo'}
                    </button>
                </div>
            )}

            {!stateUnknown && (
                <div className={styles.slots}>
                    {slots.map((s, i) => {
                        const vaga = '0' + (i + 1)

                        if (!s) {
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => openModal(i)}
                                    disabled={loading}
                                    className={styles.empty}
                                >
                                    <span
                                        className={styles.plus}
                                        aria-hidden="true"
                                    >
                                        <Plus size={26} strokeWidth={1.5} />
                                    </span>
                                    <span className={styles.slotLabel}>
                                        Ficha {vaga} · na mão
                                    </span>
                                    <span className={styles.emptyTitle}>
                                        Bote essa ficha numa faixa antes dela
                                        bombar
                                    </span>
                                    <span
                                        className={`${recipes.button} ${styles.emptyCta}`}
                                    >
                                        {loading ? (
                                            'Carregando…'
                                        ) : (
                                            <>
                                                Escolher faixa{' '}
                                                <ArrowRight
                                                    size={15}
                                                    aria-hidden="true"
                                                />
                                            </>
                                        )}
                                    </span>
                                </button>
                            )
                        }

                        const removida = s.status === 'removida'
                        const podeColetar = s.can_collect
                        // 7 dias cumpridos mas sem saldo: não é "livre pra
                        // recolher", é vaga presa. O SQL apaga a linha nesse
                        // caso, então o card não pode oferecer coleta.
                        const semSaldo = !podeColetar && s.days_to_collect === 0
                        const b = badge(s.baseline_popularity)
                        const opened = isOpen(s.id)
                        const mult = Number(s.multiplier)
                        const busy = busyId === s.id
                        const mv = movement(s, removida)

                        // Uma ficha `removida` COM saldo coletável não é um
                        // card morto: tem dinheiro em cima dele. Só apaga o
                        // que parou de medir e não tem o que recolher —
                        // senão o card cinza escondia o botão que paga.
                        const apagado = removida && !podeColetar

                        // apagado = sumido, livre = destaque, segurando = neutro
                        const cardClass = [
                            styles.card,
                            podeColetar ? styles.cardReady : '',
                            apagado ? styles.cardFaded : '',
                        ]
                            .filter(Boolean)
                            .join(' ')
                        const dotClass = apagado
                            ? styles.statusDotFaded
                            : podeColetar
                              ? styles.statusDotReady
                              : ''

                        // "Removida do Spotify" era falso: a métrica é do
                        // Deezer, e o que sumiu foi o id de lá (re-upload,
                        // troca de distribuidora, licença por região). A
                        // faixa segue tocando no Spotify — dizer o contrário
                        // é a mentira mais fácil do mundo de o usuário
                        // desmentir, e chegava junto com a perda de pontos.
                        const statusLabel = podeColetar
                            ? removida
                                ? 'Parou de medir · dá pra recolher'
                                : 'Livre pra recolher'
                            : removida
                              ? 'Não dá mais pra medir'
                              : `Segurando há ${s.days_held}d`

                        return (
                            <article key={s.id} className={cardClass}>
                                <div
                                    className={`${styles.cover} ${apagado ? styles.coverFaded : ''}`}
                                >
                                    <CoverImage
                                        src={s.track_thumbnail}
                                        track={{
                                            title: s.track_title,
                                            artist: s.artist_name,
                                        }}
                                        size="big"
                                    />
                                </div>

                                <div className={styles.statusRow}>
                                    <span className={styles.status}>
                                        <span
                                            className={`${styles.statusDot} ${dotClass}`}
                                            aria-hidden="true"
                                        />
                                        {statusLabel}
                                    </span>
                                    <span className={styles.slotLabel}>
                                        Ficha {vaga}
                                    </span>
                                </div>

                                <div className={styles.trackTitleRow}>
                                    <h2 className={styles.trackTitle}>
                                        {s.track_title}
                                    </h2>
                                    {!removida && s.last_day_gain > 0 && (
                                        <span className={styles.gain}>
                                            +{fmt(s.last_day_gain)}
                                        </span>
                                    )}
                                </div>
                                <p className={styles.trackArtist}>
                                    {s.artist_name}
                                </p>

                                {/* o recorde e a distância até ele — é o que
                                    decide se rende ponto. Clicável → abre o
                                    gráfico de evolução. */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setChartStake(s)
                                        capture('stake_chart_opened', {
                                            stake_id: s.id,
                                            track_title: s.track_title,
                                        })
                                    }}
                                    className={styles.movement}
                                >
                                    <span
                                        className={styles.movementIcon}
                                        style={{
                                            color: mv.color,
                                            background: `color-mix(in srgb, ${mv.color} 14%, transparent)`,
                                        }}
                                        aria-hidden="true"
                                    >
                                        {mv.arrow}
                                    </span>
                                    <span className={styles.movementText}>
                                        <span
                                            className={styles.movementHeadline}
                                            style={{
                                                display: 'block',
                                                color:
                                                    mv.tone === 'record'
                                                        ? mv.color
                                                        : 'var(--club-text)',
                                            }}
                                        >
                                            {mv.headline}
                                        </span>
                                        <span
                                            className={styles.movementSub}
                                            style={{ display: 'block' }}
                                        >
                                            {mv.sub}
                                        </span>
                                    </span>
                                    {mv.tag && (
                                        <span
                                            className={styles.movementTag}
                                            style={{ color: mv.color }}
                                        >
                                            {mv.tag}
                                        </span>
                                    )}
                                    <BarChart3
                                        size={16}
                                        className={styles.chartIcon}
                                        aria-hidden="true"
                                    />
                                    <span className="sr-only">
                                        Abrir o gráfico da popularidade
                                    </span>
                                </button>

                                {/* A ordem importa: coletável vem antes de
                                    `removida`, porque parar de medir não
                                    anula saldo já ganho (028). */}
                                <div className={styles.actions}>
                                    {podeColetar ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => recolher(s)}
                                                disabled={busy}
                                                className={`${recipes.button} ${styles.fullButton}`}
                                            >
                                                {busy
                                                    ? 'Recolhendo…'
                                                    : 'Recolher · ' +
                                                      fmt(s.accumulated_points) +
                                                      ' pts'}
                                            </button>
                                            <p className={styles.actionNote}>
                                                {removida
                                                    ? 'Parou de render · o que juntou é seu'
                                                    : 'Trava cumprida · recolha quando quiser'}
                                            </p>
                                        </>
                                    ) : removida ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => recolher(s)}
                                                disabled={busy}
                                                className={`${recipes.outlineButton} ${styles.fullButton}`}
                                            >
                                                {busy
                                                    ? 'Liberando…'
                                                    : 'Liberar a vaga'}
                                            </button>
                                            <p className={styles.actionNote}>
                                                {s.accumulated_points > 0
                                                    ? `Perdemos a medição dessa faixa · recolha os ${fmt(s.accumulated_points)} pts em ${s.days_to_collect} ${s.days_to_collect === 1 ? 'dia' : 'dias'}`
                                                    : 'Perdemos a medição dessa faixa · não chegou a render'}
                                            </p>
                                        </>
                                    ) : semSaldo ? (
                                        <>
                                            <button
                                                type="button"
                                                disabled
                                                className={styles.waitButton}
                                            >
                                                Sem nada pra recolher
                                            </button>
                                            <p className={styles.actionNote}>
                                                <span>
                                                    Ela ainda pode subir — ou
                                                    você troca de faixa
                                                </span>
                                                <span aria-hidden="true">·</span>
                                                <button
                                                    type="button"
                                                    onClick={() => recolher(s)}
                                                    disabled={busy}
                                                    className={styles.inlineAction}
                                                >
                                                    {busy
                                                        ? 'liberando…'
                                                        : 'liberar a vaga'}
                                                </button>
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                disabled
                                                className={styles.waitButton}
                                            >
                                                {s.accumulated_points > 0
                                                    ? fmt(s.accumulated_points) +
                                                      ' pts acumulados'
                                                    : 'Acumulando pontos…'}
                                            </button>
                                            <p className={styles.actionNote}>
                                                <span>
                                                    Recolher libera em{' '}
                                                    {s.days_to_collect}{' '}
                                                    {s.days_to_collect === 1
                                                        ? 'dia'
                                                        : 'dias'}
                                                </span>
                                                <span aria-hidden="true">·</span>
                                                <button
                                                    type="button"
                                                    onClick={() => recolher(s)}
                                                    disabled={busy}
                                                    className={styles.inlineAction}
                                                >
                                                    {busy
                                                        ? 'removendo…'
                                                        : 'remover assim mesmo'}
                                                </button>
                                            </p>
                                        </>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toggleInfo(s.id)}
                                    aria-expanded={opened}
                                    className={`${styles.infoToggle} ${opened ? styles.infoToggleOpen : ''}`}
                                >
                                    {opened
                                        ? 'Esconder infos'
                                        : 'Ver infos da ficha'}
                                    <ChevronDown size={14} aria-hidden="true" />
                                </button>

                                {opened && (
                                    <div className={`anim-slide ${styles.info}`}>
                                        <div className={styles.infoTop}>
                                            <div>
                                                <div className={styles.infoLabel}>
                                                    Multiplicador da ficha
                                                </div>
                                                <div className={styles.multBig}>
                                                    {formatMultiplier(mult)}
                                                </div>
                                            </div>
                                            <span
                                                className={`${styles.badge} ${b.className}`}
                                            >
                                                {b.text}
                                            </span>
                                        </div>
                                        <div>
                                            <div className={styles.popHead}>
                                                <span>Popularidade</span>
                                                <span>
                                                    {Math.round(
                                                        s.baseline_popularity
                                                    )}{' '}
                                                    na ficha · recorde{' '}
                                                    {picoDe(s)} · agora{' '}
                                                    {Math.round(s.last_popularity)}
                                                </span>
                                            </div>
                                            <div className={styles.bar}>
                                                {/* trilha até o recorde: o
                                                    território já conquistado,
                                                    que é o que virou ponto */}
                                                <div
                                                    className={styles.barPeak}
                                                    style={{
                                                        width: picoDe(s) + '%',
                                                    }}
                                                />
                                                <div
                                                    className={styles.barNow}
                                                    style={{
                                                        width:
                                                            Math.round(
                                                                s.last_popularity
                                                            ) + '%',
                                                        background: mv.color,
                                                    }}
                                                />
                                                {/* onde a ficha foi botada */}
                                                <div
                                                    className={styles.barBase}
                                                    style={{
                                                        left: `calc(${Math.round(
                                                            s.baseline_popularity
                                                        )}% - 0.5px)`,
                                                    }}
                                                />
                                                {/* o recorde: a marca que
                                                    precisa ser batida pra
                                                    render de novo */}
                                                {picoDe(s) >
                                                    Math.round(
                                                        s.baseline_popularity
                                                    ) && (
                                                    <div
                                                        className={styles.barRecord}
                                                        style={{
                                                            left: `calc(${picoDe(s)}% - 1px)`,
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <p className={styles.barNote}>
                                                O traço fino é onde você botou
                                                a ficha; o destacado é o
                                                recorde — só passar dele rende
                                                ponto.
                                            </p>
                                        </div>
                                        <p className={styles.infoFoot}>
                                            {fmt(s.pessoas_deram_stake)}{' '}
                                            {s.pessoas_deram_stake === 1
                                                ? 'pessoa botou ficha'
                                                : 'pessoas botaram ficha'}{' '}
                                            · {fmt(s.accumulated_points)} pontos
                                            acumulados
                                            {!removida && s.last_day_gain > 0
                                                ? ` · +${fmt(s.last_day_gain)} na última medição`
                                                : ''}
                                        </p>
                                    </div>
                                )}
                            </article>
                        )
                    })}
                </div>
            )}

            {/* BUSCA E CONFIRMAÇÃO */}
            {modalOpen && (
                <div
                    onClick={closeModal}
                    className={`anim-fade ${styles.backdrop}`}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ficha-dialog-title"
                        className={`anim-pop ${styles.dialog}`}
                    >
                        <div className={styles.dialogHead}>
                            <div>
                                <p className={styles.dialogKicker}>
                                    Botar a ficha{' '}
                                    {modalSlot != null
                                        ? '0' + (modalSlot + 1)
                                        : ''}
                                </p>
                                <h3
                                    id="ficha-dialog-title"
                                    className={styles.dialogTitle}
                                >
                                    {selected
                                        ? 'Confira e bote a ficha'
                                        : 'Buscar faixa'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Fechar"
                                className={styles.close}
                            >
                                <X size={17} aria-hidden="true" />
                            </button>
                        </div>

                        {searchView && (
                            <>
                                <div className={styles.searchWrap}>
                                    <div className={styles.searchField}>
                                        <Search size={19} aria-hidden="true" />
                                        <input
                                            value={query}
                                            onChange={(e) =>
                                                setQuery(e.target.value)
                                            }
                                            autoFocus
                                            aria-label="Buscar faixa"
                                            placeholder="Nome da faixa ou artista…"
                                        />
                                        {query && (
                                            <button
                                                type="button"
                                                onClick={() => setQuery('')}
                                                aria-label="Limpar busca"
                                                className={styles.clear}
                                            >
                                                <X size={13} aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.results}>
                                    {query.trim().length < 2 && (
                                        <div className={styles.searchHint}>
                                            <div
                                                className={styles.searchHintIcon}
                                                aria-hidden="true"
                                            >
                                                <Search
                                                    size={24}
                                                    strokeWidth={1.8}
                                                />
                                            </div>
                                            <strong>
                                                Busque a faixa que vai bombar
                                            </strong>
                                            <p>
                                                Comece a digitar o nome. Você
                                                confere as infos dela antes de
                                                botar a ficha.
                                            </p>
                                        </div>
                                    )}
                                    {searching &&
                                        Array.from({ length: 5 }).map(
                                            (_, i) => (
                                                <div
                                                    key={i}
                                                    className={styles.skeleton}
                                                    style={{
                                                        opacity: 1 - i * 0.16,
                                                    }}
                                                    aria-hidden="true"
                                                >
                                                    <div
                                                        className={`anim-pulse ${styles.skeletonBlock}`}
                                                        style={{
                                                            width: 56,
                                                            height: 56,
                                                            flex: 'none',
                                                            animationDelay: `${i * 90}ms`,
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            minWidth: 0,
                                                        }}
                                                    >
                                                        <div
                                                            className={`anim-pulse ${styles.skeletonBlock}`}
                                                            style={{
                                                                height: 15,
                                                                width: `${72 - i * 9}%`,
                                                            }}
                                                        />
                                                        <div
                                                            className={`anim-pulse ${styles.skeletonBlock}`}
                                                            style={{
                                                                height: 11,
                                                                marginTop: 10,
                                                                width: `${44 - i * 5}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    {!searching &&
                                        results.map((r) => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => selectTrack(r)}
                                                className={styles.result}
                                            >
                                                <span
                                                    className={styles.resultCover}
                                                >
                                                    <CoverImage
                                                        src={r.thumbnail}
                                                        track={r}
                                                        size="slot"
                                                    />
                                                </span>
                                                <span
                                                    className={styles.resultText}
                                                >
                                                    <span
                                                        className={
                                                            styles.resultTitle
                                                        }
                                                        style={{
                                                            display: 'block',
                                                        }}
                                                    >
                                                        {r.title}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.resultArtist
                                                        }
                                                        style={{
                                                            display: 'block',
                                                        }}
                                                    >
                                                        {r.artist}
                                                    </span>
                                                </span>
                                                <ArrowRight
                                                    size={18}
                                                    className={styles.resultArrow}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        ))}
                                    {!searching &&
                                        query.trim().length >= 2 &&
                                        results.length === 0 && (
                                            <p className={styles.noResults}>
                                                Nenhuma faixa encontrada pra
                                                &quot;{query}&quot;.
                                            </p>
                                        )}
                                </div>
                            </>
                        )}

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

            {/* MODAL DO GRÁFICO */}
            {chartStake && (
                <StakeChartModal
                    stakeId={chartStake.id}
                    title={chartStake.track_title}
                    artist={chartStake.artist_name}
                    baseline={chartStake.baseline_popularity}
                    current={chartStake.last_popularity}
                    peak={picoDe(chartStake)}
                    multiplier={Number(chartStake.multiplier)}
                    accumulatedPoints={chartStake.accumulated_points}
                    initialSnapshots={chartStake.snapshots}
                    onClose={() => setChartStake(null)}
                />
            )}
        </div>
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
        <div className={`anim-slide ${styles.detail}`}>
            <button type="button" onClick={onBack} className={styles.back}>
                <ArrowLeft size={15} aria-hidden="true" />
                Buscar outra
            </button>

            <div className={styles.detailHero}>
                <div className={`${recipes.sleeve} ${styles.detailCover}`}>
                    <CoverImage
                        src={track.cover ?? track.thumbnail}
                        track={track}
                        size="big"
                    />
                </div>
                <div className={styles.detailTitle}>{track.title}</div>
                <div className={styles.detailArtist}>{track.artist}</div>
            </div>

            {/* multiplicador + popularidade */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <div className={styles.statLabel}>Multiplicador</div>
                    <div
                        className={styles.statValue}
                        style={{ color: b.multColor }}
                    >
                        {multLabel}
                    </div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statTop}>
                        <span className={styles.statLabel}>Popularidade</span>
                        <span className={styles.statSmall}>
                            {previewing ? '…' : pop}
                        </span>
                    </div>
                    <div className={styles.popMini}>
                        <div style={{ width: pop + '%' }} />
                    </div>
                </div>
            </div>

            <p className={styles.rules}>
                O multiplicador trava em {multLabel} e não muda mais. A ficha
                rende toda vez que a faixa bate o próprio recorde de
                popularidade — <b>cair nunca tira ponto</b>, só adia o próximo.
                A partir de {MIN_DAYS} dias você recolhe; antes disso dá pra
                desistir, mas aí zera.
            </p>

            <button
                type="button"
                onClick={onConfirm}
                disabled={staking || previewing}
                className={`${recipes.button} ${styles.confirm}`}
            >
                {staking ? 'Botando…' : `Botar ficha · ${multLabel}`}
            </button>
        </div>
    )
}
