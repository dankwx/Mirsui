'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Loader2, Play, Plus } from 'lucide-react'
import { FeedPostWithInteractions } from '@/utils/feedService.backend'
import { RecentClaim } from '@/utils/feedService.backend'
import { formatTimestamp } from '@/utils/feedHelpers'
import RecentClaims from '@/components/RecentClaims/RecentClaims'
import { createClient } from '@/utils/supabase/client'
import { toggleTrackLike } from '@/utils/trackActions'

interface FeedContentProps {
    initialPosts: (FeedPostWithInteractions & { isLiked: boolean })[]
    recentClaims: RecentClaim[]
    currentUserId: string | null
}

type FeedPost = FeedPostWithInteractions & { isLiked: boolean }

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

/* ---------- helpers de apresentação (direção Acervo) ---------- */
const TONES = [
    '#241f1a', '#1c2320', '#27201f', '#1b2026', '#231d27', '#202420',
    '#2a201b', '#1a2326', '#25211c', '#1d2126', '#26211f', '#1f231d',
]
function tone(seed: string) {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
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
function ordLabel(n: number | null | undefined) {
    if (!n || n < 1) return '—'
    return `${n}ª`
}
function timeAgo(ts: string | null) {
    if (!ts) return ''
    const v = formatTimestamp(ts)
    return v === 'agora mesmo' ? 'agora mesmo' : `há ${v}`
}
function trackHref(post: { track_url?: string | null; track_title: string }) {
    return `/track/${post.track_url?.split('/').pop() || post.track_title}`
}
function whoOf(post: FeedPost) {
    return post.display_name || post.username
}

/* ---------- estado de "salvar" reutilizável ---------- */
function useSave(post: FeedPost, isAuthenticated: boolean) {
    const [saved, setSaved] = useState(post.isLiked)
    const [count, setCount] = useState(post.likes_count)
    const [busy, setBusy] = useState(false)

    const toggle = async () => {
        if (!isAuthenticated || busy) return
        setBusy(true)
        const next = !saved
        // atualização otimista
        setSaved(next)
        setCount((c) => c + (next ? 1 : -1))
        try {
            const result = await toggleTrackLike(post.id, next)
            if (!result.success) {
                setSaved(!next)
                setCount((c) => c + (next ? -1 : 1))
            }
        } catch {
            setSaved(!next)
            setCount((c) => c + (next ? -1 : 1))
        } finally {
            setBusy(false)
        }
    }

    return { saved, count, busy, toggle }
}

/* ---------- Capa tonal de fallback ---------- */
function Cover({
    seed,
    thumbnail,
    className,
    iniClassName,
}: {
    seed: string
    thumbnail?: string | null
    className: string
    iniClassName: string
}) {
    if (thumbnail) {
        return (
            <img
                src={thumbnail}
                alt={seed}
                className={`${className} flex-none object-cover`}
            />
        )
    }
    return (
        <div className={`mir-cover ${className} flex-none`} style={{ ['--tone' as string]: tone(seed) }}>
            <span
                className={`absolute bottom-0.5 left-2.5 select-none font-extrabold leading-[0.8] tracking-[-0.05em] text-white/[0.07] ${iniClassName}`}
            >
                {initials(seed)}
            </span>
        </div>
    )
}

/* ---------- Ticker ao vivo ---------- */
function Ticker({ posts }: { posts: FeedPost[] }) {
    const segments = useMemo(() => {
        const items = posts
            .slice(0, 8)
            .map((p) => `${whoOf(p).toUpperCase()} SALVOU ${p.track_title.toUpperCase()}`)
        return items.length > 0
            ? items
            : ['A CENA ESTÁ EM SILÊNCIO — SEJA O PRIMEIRO A SALVAR']
    }, [posts])

    const line = (
        <span className="inline-flex shrink-0 items-center font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
            <span className="px-4">● AO VIVO</span>
            {segments.map((s, i) => (
                <span key={i} className="inline-flex items-center">
                    <span className="px-3 text-[#16120c]/55">✦</span>
                    <span className="whitespace-nowrap">{s}</span>
                </span>
            ))}
            <span className="px-3 text-[#16120c]/55">✦</span>
        </span>
    )

    return (
        <div className="overflow-hidden border-b-2 border-mir-bg bg-mir-acc text-mir-on-acc">
            <div className="flex w-max animate-[mir-ticker_38s_linear_infinite] py-[7px] will-change-transform hover:[animation-play-state:paused]">
                {line}
                {line}
            </div>
        </div>
    )
}

/* ---------- O drop de hoje (faixa em destaque, fundo papel) ---------- */
function DropSection({
    post,
    isAuthenticated,
}: {
    post: FeedPost
    isAuthenticated: boolean
}) {
    const { saved, busy, toggle } = useSave(post, isAuthenticated)
    const who = whoOf(post)
    const early = typeof post.position === 'number' && post.position <= 10

    return (
        <section className="w-full border-y border-mir-line bg-[#ece3d2] text-[#16120c]">
            <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-10 sm:py-[60px]">
                <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[#c14a26]">
                    ★ O drop de hoje
                </div>
                <div className="flex flex-wrap items-center gap-8 sm:gap-12">
                    <Link href={trackHref(post)} className="group relative block flex-none">
                        <Cover
                            seed={post.artist_name}
                            thumbnail={post.track_thumbnail}
                            className="h-[220px] w-[220px] rounded-lg shadow-[0_26px_50px_-22px_rgba(22,18,12,0.55)] sm:h-[280px] sm:w-[280px]"
                            iniClassName="text-[72px]"
                        />
                        <span className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-mir-bg text-mir-acc shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition group-hover:scale-105">
                            <Play className="h-5 w-5 fill-current" />
                        </span>
                    </Link>

                    <div className="min-w-[280px] flex-1">
                        <Link href={trackHref(post)} className="block w-max max-w-full">
                            <h2 className="text-[clamp(30px,4vw,44px)] font-extrabold leading-[0.98] tracking-[-0.04em] transition-opacity hover:opacity-80">
                                {post.track_title}
                            </h2>
                        </Link>
                        <div className="mt-2 font-mono text-[13px] tracking-[0.04em] text-[#16120c]/60">
                            {post.artist_name}
                        </div>

                        <p className="mt-5 max-w-[520px] text-[16px] leading-[1.5] text-[#16120c]/75">
                            <b className="font-semibold">{who}</b> achou cedo e salvou{' '}
                            {timeAgo(post.claimedat) || 'recentemente'}.{' '}
                            {early
                                ? 'A janela ainda está aberta — salva antes de virar tendência.'
                                : 'Entre na lista de quem ouviu antes do algoritmo.'}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                            <button
                                onClick={toggle}
                                disabled={busy || !isAuthenticated}
                                title={!isAuthenticated ? 'Entre para salvar' : ''}
                                className={`inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold transition active:translate-y-px disabled:opacity-60 ${
                                    saved
                                        ? 'border-[1.5px] border-[#16120c]/35 bg-transparent text-[#16120c]'
                                        : 'bg-mir-bg text-mir-acc hover:brightness-110'
                                }`}
                            >
                                {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {saved ? 'Salva no seu acervo' : 'Salvar agora'}
                            </button>
                            <span className="font-mono text-[12px] text-[#16120c]/55">
                                {ordLabel(post.position)} a salvar · {post.likes_count} no acervo
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ---------- Item do feed (estilo activity editorial) ---------- */
function FeedItem({
    post,
    isAuthenticated,
}: {
    post: FeedPost
    isAuthenticated: boolean
}) {
    const { saved, count, busy, toggle } = useSave(post, isAuthenticated)

    const early = typeof post.position === 'number' && post.position <= 10
    const who = whoOf(post)

    return (
        <article className="grid grid-cols-[72px_1fr] gap-3.5 border-t border-mir-line py-[22px] sm:grid-cols-[96px_1fr] sm:gap-[18px]">
            <Link href={trackHref(post)} className="block">
                <Cover
                    seed={post.artist_name}
                    thumbnail={post.track_thumbnail}
                    className="h-[72px] w-[72px] rounded-[9px] sm:h-24 sm:w-24"
                    iniClassName="text-[21px] sm:text-[38px]"
                />
            </Link>

            <div className="flex min-w-0 flex-col">
                <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-mir-text2">
                    <Link
                        href={`/user/${post.username}`}
                        className="flex items-center gap-2 transition-colors hover:text-mir-text"
                    >
                        <span className="flex h-6 w-6 flex-none items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(120%_120%_at_30%_22%,#322c22,#1b1813)] text-[10px] font-extrabold tracking-[-0.03em] text-mir-text">
                            {post.avatar_url ? (
                                <img src={post.avatar_url} alt={who} className="h-full w-full object-cover" />
                            ) : (
                                (who || 'U').charAt(0).toUpperCase()
                            )}
                        </span>
                        <span>
                            <b className="font-semibold text-mir-text">{who}</b> salvou
                        </span>
                    </Link>
                    <span className="text-mir-text3">·</span>
                    <span className="font-mono text-[11px] text-mir-text3">{timeAgo(post.claimedat)}</span>
                    {early && (
                        <span className="rounded border border-mir-acc/40 bg-mir-acc-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-mir-acc">
                            {post.position === 1 ? '1º a salvar' : 'cedo'}
                        </span>
                    )}
                </div>

                <Link href={trackHref(post)} className="mt-2.5 block w-max max-w-full">
                    <h3 className="truncate text-[18px] font-bold leading-[1.15] tracking-[-0.015em] text-mir-text transition-colors hover:text-mir-acc">
                        {post.track_title}
                    </h3>
                </Link>
                <div className="mt-0.5 truncate text-[13.5px] text-mir-text2">{post.artist_name}</div>

                <div className="mt-3 flex flex-wrap items-center gap-4">
                    <span
                        className={`inline-flex items-center gap-[7px] font-mono text-[11px] tracking-[0.03em] ${
                            early ? 'text-mir-acc' : 'text-mir-text2'
                        }`}
                    >
                        {early && (
                            <span className="inline-block h-1.5 w-1.5 flex-none rounded-full bg-mir-acc shadow-[0_0_0_3px_rgba(132,184,106,0.14)]" />
                        )}
                        <span className={early ? 'font-semibold text-mir-acc' : 'font-semibold text-mir-text'}>
                            {ordLabel(post.position)}
                        </span>
                        a salvar
                    </span>
                    <span className="font-mono text-[11px] text-mir-text3">{count} também têm</span>

                    <div className="ml-auto flex gap-2">
                        <button
                            onClick={toggle}
                            disabled={busy || !isAuthenticated}
                            title={!isAuthenticated ? 'Entre para salvar' : ''}
                            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-[7px] text-[12.5px] font-semibold transition active:translate-y-px disabled:opacity-60 ${
                                saved
                                    ? 'border border-mir-line2 bg-transparent text-mir-text2 hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text'
                                    : 'bg-mir-acc text-mir-on-acc hover:brightness-[1.07]'
                            }`}
                        >
                            {saved ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                            {saved ? 'Salva' : 'Salvar'}
                        </button>
                        <Link
                            href={trackHref(post)}
                            aria-label="Abrir faixa"
                            className="inline-flex items-center justify-center rounded-full border border-mir-line2 p-[9px] text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text"
                        >
                            <Play className="h-3.5 w-3.5 fill-current" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    )
}

/* ---------- Cartão Faro (rail, destaque lima) ---------- */
function FaroCard() {
    return (
        <Link
            href="/claimtrack"
            className="group block rounded-[14px] bg-mir-acc p-[22px] text-mir-on-acc transition hover:brightness-[1.04]"
        >
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                Você esta semana
            </span>
            <p className="mt-3 text-[22px] font-extrabold leading-[1.04] tracking-[-0.03em]">
                Reivindique o que você achou primeiro.
            </p>
            <p className="mt-2 font-mono text-[11.5px] leading-[1.5] text-mir-on-acc/70">
                Seu nome fica no histórico da faixa. Ouça cedo, prove o faro.
            </p>
            <span className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-mir-bg text-[13px] font-bold text-mir-acc">
                Reivindicar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
        </Link>
    )
}

/* ---------- App ---------- */
export default function FeedContent({ initialPosts, recentClaims, currentUserId }: FeedContentProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(initialPosts.length === 5)
    const [tab, setTab] = useState<'cena' | 'seguindo'>('cena')
    const [clock, setClock] = useState('--:--:--')

    const isAuthenticated = !!currentUserId

    // Relógio ao vivo "ATUALIZADO HH:MM:SS" (apenas no cliente, evita hidratação divergente)
    useEffect(() => {
        const fmt = () => {
            const d = new Date()
            const p = (n: number) => String(n).padStart(2, '0')
            setClock(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`)
        }
        fmt()
        const t = setInterval(fmt, 1000)
        return () => clearInterval(t)
    }, [])

    // Sem dados de "quem você segue" nesta carga; a aba fica preparada
    // para quando essa relação for fornecida pelo backend.
    const onCena = tab === 'cena'
    const drop = onCena ? posts[0] : undefined
    const feed = useMemo(() => (onCena ? posts.slice(1) : []), [onCena, posts])

    const loadMorePosts = async () => {
        setLoading(true)
        const scrollPosition = window.scrollY
        try {
            const response = await fetch(`${BACKEND_URL}/feed?limit=5&offset=${posts.length}`)
            if (!response.ok) {
                setLoading(false)
                return
            }
            const data = await response.json()
            const newPosts = data.posts || []
            if (newPosts.length === 0) {
                setHasMore(false)
                setLoading(false)
                return
            }

            const trackIds = newPosts.map((post: any) => post.id)
            let userLikes: Set<number> = new Set()
            try {
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()
                const headers: HeadersInit = { 'Content-Type': 'application/json' }
                if (session?.access_token) {
                    headers['Authorization'] = `Bearer ${session.access_token}`
                }
                const likesResponse = await fetch(`${BACKEND_URL}/feed/user-likes`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ track_ids: trackIds }),
                })
                if (likesResponse.ok) {
                    const likesData = await likesResponse.json()
                    userLikes = new Set(likesData.liked_tracks || [])
                }
            } catch (error) {
                console.error('Erro ao buscar likes:', error)
            }

            const postsWithLikes = newPosts.map((post: any) => ({
                ...post,
                isLiked: userLikes.has(post.id),
            }))
            setPosts([...posts, ...postsWithLikes])
            if (newPosts.length < 5) setHasMore(false)
            setTimeout(() => window.scrollTo(0, scrollPosition), 0)
        } catch (error) {
            console.error('Erro ao carregar mais posts:', error)
        } finally {
            setLoading(false)
        }
    }

    const hasAny = posts.length > 0

    return (
        <div className="w-full">
            {/* Ticker ao vivo */}
            <Ticker posts={posts} />

            {/* Cabeçalho editorial */}
            <header className="mx-auto w-full max-w-[1180px] px-5 pt-12 sm:px-10 sm:pt-14">
                <span className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-mir-acc">
                    <span className="inline-block h-2 w-2 rounded-full bg-mir-acc animate-[mir-pulse_2s_infinite]" />
                    Agora · atualizado {clock}
                </span>
                <h1 className="mt-4 max-w-[18ch] text-[clamp(34px,5.4vw,56px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-mir-text">
                    A cena, salvando em tempo real
                </h1>
                <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.55] text-mir-text2">
                    Quem ouviu primeiro o quê — e o que ainda dá tempo de você salvar{' '}
                    <em className="not-italic font-medium text-mir-acc">antes de virar tendência</em>.
                </p>

                <div className="mt-6 flex w-max gap-1 rounded-full border border-mir-line bg-mir-fill1 p-[3px]">
                    {([
                        ['cena', 'Da cena'],
                        ['seguindo', 'De quem você segue'],
                    ] as const).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`whitespace-nowrap rounded-full px-[18px] py-2 text-[13px] font-semibold transition-colors ${
                                tab === key
                                    ? 'bg-mir-acc text-mir-on-acc'
                                    : 'text-mir-text2 hover:text-mir-text'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </header>

            {/* O drop de hoje (faixa líder) */}
            {drop && (
                <div className="mt-12 sm:mt-14">
                    <DropSection post={drop} isAuthenticated={isAuthenticated} />
                </div>
            )}

            {/* Grid principal */}
            <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-10">
                <div className="grid grid-cols-1 items-start gap-[34px] pb-[70px] pt-[30px] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-[46px]">
                    <section className="flex flex-col">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-1">
                            <h2 className="text-[26px] font-extrabold tracking-[-0.03em] text-mir-text">
                                Despachos da cena
                            </h2>
                            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mir-text3">
                                {onCena ? 'A cena inteira' : 'Quem você segue'}
                            </span>
                        </div>

                        {feed.length > 0 ? (
                            <>
                                {feed.map((post) => (
                                    <FeedItem key={post.id} post={post} isAuthenticated={isAuthenticated} />
                                ))}

                                {onCena && hasMore && (
                                    <div className="flex justify-center pt-7">
                                        <button
                                            onClick={loadMorePosts}
                                            disabled={loading}
                                            className="inline-flex items-center gap-2 rounded-full border border-mir-line2 px-7 py-3 font-mono text-[12px] uppercase tracking-[0.1em] text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Carregando...
                                                </>
                                            ) : (
                                                'Carregar mais despachos'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="mt-2 rounded-[13px] border border-dashed border-mir-line2 p-[54px] text-center font-mono text-[13px] text-mir-text3">
                                {!onCena
                                    ? 'Você ainda não segue ninguém salvando.'
                                    : hasAny
                                      ? 'Por enquanto, só o drop de hoje. Volte logo para mais despachos.'
                                      : 'O radar ainda está em silêncio. Seja o primeiro a salvar uma faixa.'}
                            </div>
                        )}
                    </section>

                    <aside className="flex flex-col gap-[22px] lg:sticky lg:top-[84px]">
                        <RecentClaims claims={recentClaims} />
                        <FaroCard />
                    </aside>
                </div>
            </div>
        </div>
    )
}
