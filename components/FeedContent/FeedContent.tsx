'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Loader2, Play, Plus, Check } from 'lucide-react'
import { FeedPostWithInteractions } from '@/utils/feedService.backend'
import { RecentClaim } from '@/utils/feedService.backend'
import { formatTimestamp } from '@/utils/feedHelpers'
import { useAuth } from '@/components/AuthProvider/AuthProvider'
import RecentClaims from '@/components/RecentClaims/RecentClaims'
import { createClient } from '@/utils/supabase/client'
import { toggleTrackLike } from '@/utils/trackActions'

interface FeedContentProps {
    initialPosts: (FeedPostWithInteractions & { isLiked: boolean })[]
    recentClaims: RecentClaim[]
}

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

/* ---------- Capa tonal de fallback ---------- */
function Cover({
    seed,
    thumbnail,
    size,
}: {
    seed: string
    thumbnail?: string | null
    size: 'lg' | 'sm'
}) {
    const dim = size === 'lg' ? 'h-24 w-24 rounded-[9px]' : 'h-10 w-10 rounded-md'
    if (thumbnail) {
        return (
            <img
                src={thumbnail}
                alt={seed}
                className={`${dim} flex-none object-cover`}
            />
        )
    }
    return (
        <div
            className={`mir-cover ${dim} flex-none`}
            style={{ ['--tone' as string]: tone(seed) }}
        >
            <span
                className={`absolute bottom-0.5 left-2.5 select-none font-extrabold leading-[0.8] tracking-[-0.05em] text-white/[0.07] ${
                    size === 'lg' ? 'text-[38px]' : 'text-[21px]'
                }`}
            >
                {initials(seed)}
            </span>
        </div>
    )
}

/* ---------- Item do feed (estilo activity editorial) ---------- */
function FeedItem({
    post,
}: {
    post: FeedPostWithInteractions & { isLiked: boolean }
}) {
    const { isAuthenticated } = useAuth()
    const [saved, setSaved] = useState(post.isLiked)
    const [count, setCount] = useState(post.likes_count)
    const [busy, setBusy] = useState(false)

    const early = typeof post.position === 'number' && post.position <= 10
    const who = post.display_name || post.username

    const toggleSave = async () => {
        if (!isAuthenticated || busy) return
        setBusy(true)
        const next = !saved
        // atualização otimista
        setSaved(next)
        setCount((c) => c + (next ? 1 : -1))
        try {
            const result = await toggleTrackLike(post.id, next)
            if (!result.success) {
                // reverte em caso de erro
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

    return (
        <article className="grid grid-cols-[72px_1fr] gap-3.5 border-b border-mir-line py-[22px] first:pt-1 sm:grid-cols-[96px_1fr] sm:gap-[18px]">
            <Link href={trackHref(post)} className="block">
                <Cover seed={post.artist_name} thumbnail={post.track_thumbnail} size="lg" />
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
                            onClick={toggleSave}
                            disabled={busy || !isAuthenticated}
                            title={!isAuthenticated ? 'Entre para salvar' : ''}
                            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-[7px] text-[12.5px] font-semibold transition active:translate-y-px disabled:opacity-60 ${
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
                            className="inline-flex items-center justify-center rounded-lg border border-mir-line2 p-[7px] text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text"
                        >
                            <Play className="h-3.5 w-3.5 fill-current" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    )
}

/* ---------- App ---------- */
export default function FeedContent({ initialPosts, recentClaims }: FeedContentProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(initialPosts.length === 5)
    const [tab, setTab] = useState<'cena' | 'seguindo'>('cena')

    // Sem dados de "quem você segue" nesta carga; a aba fica preparada
    // para quando essa relação for fornecida pelo backend.
    const feed = useMemo(
        () => (tab === 'seguindo' ? [] : posts),
        [tab, posts]
    )

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

    return (
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-10">
            {/* Cabeçalho editorial */}
            <header className="pt-10">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mir-text3">
                    Agora
                </span>
                <h1 className="mt-2.5 max-w-[18ch] text-[clamp(30px,4.6vw,44px)] font-extrabold leading-[1.02] tracking-[-0.035em] text-mir-text">
                    A cena, salvando em tempo real
                </h1>
                <p className="mt-3.5 max-w-[60ch] text-[15.5px] leading-[1.55] text-mir-text2">
                    Quem ouviu primeiro o quê — e o que ainda dá tempo de você salvar antes de
                    virar tendência.
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

            {/* Grid principal */}
            <div className="grid grid-cols-1 items-start gap-[34px] pb-[70px] pt-[30px] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-[46px]">
                <section className="flex flex-col">
                    {feed.length > 0 ? (
                        <>
                            {feed.map((post) => (
                                <FeedItem key={post.id} post={post} />
                            ))}

                            {tab === 'cena' && hasMore && (
                                <div className="flex justify-center pt-7">
                                    <button
                                        onClick={loadMorePosts}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 rounded-lg border border-mir-line2 px-6 py-2.5 text-[13px] font-semibold text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Carregando...
                                            </>
                                        ) : (
                                            'Carregar mais'
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="rounded-[13px] border border-dashed border-mir-line2 p-[54px] text-center font-mono text-[13px] text-mir-text3">
                            {tab === 'seguindo'
                                ? 'Você ainda não segue ninguém salvando.'
                                : 'O radar ainda está em silêncio. Seja o primeiro a salvar uma faixa.'}
                        </div>
                    )}
                </section>

                <aside className="lg:sticky lg:top-[84px]">
                    <RecentClaims claims={recentClaims} />
                </aside>
            </div>
        </div>
    )
}
