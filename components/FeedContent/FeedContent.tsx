'use client'

import React, { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowUpRight, Check, Loader2, Plus, RotateCw } from 'lucide-react'
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
    /** a busca no servidor falhou — diferente de "não veio nada" */
    loadFailed?: boolean
    /** idem, para a lista do "subindo na cena" (chamada separada) */
    recentClaimsFailed?: boolean
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
    if (!n || n < 1) return null
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
function isEarly(post: FeedPost) {
    return typeof post.position === 'number' && post.position <= 10
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

/* ---------- Capa (as iniciais ficam por baixo, como fallback) ---------- */
function Cover({
    seed,
    thumbnail,
    size,
    className,
    iniClassName,
    priority,
}: {
    seed: string
    thumbnail?: string | null
    size: number
    className: string
    iniClassName: string
    priority?: boolean
}) {
    return (
        <div
            className={`mir-cover ${className} flex-none`}
            style={{ ['--tone' as string]: tone(seed) }}
        >
            <span
                aria-hidden="true"
                className={`absolute inset-0 grid select-none place-items-center font-extrabold leading-none tracking-[-0.05em] text-mir-text/15 ${iniClassName}`}
            >
                {initials(seed)}
            </span>
            {thumbnail && (
                <Image
                    src={thumbnail}
                    alt=""
                    width={size}
                    height={size}
                    priority={priority}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            )}
        </div>
    )
}

/* ---------- Ticker ao vivo ---------- */
function Ticker({ posts, loadFailed = false }: { posts: FeedPost[]; loadFailed?: boolean }) {
    const segments = useMemo(() => {
        const items = posts
            .slice(0, 8)
            .map((p) => `${whoOf(p).toUpperCase()} SALVOU ${p.track_title.toUpperCase()}`)
        if (items.length > 0) return items
        // sem dados por falha, a cena pode estar cheia — dizer que está em
        // silêncio seria afirmar o que a gente não sabe
        return loadFailed
            ? ['SEM SINAL DA CENA AGORA']
            : ['A CENA ESTÁ EM SILÊNCIO. SEJA O PRIMEIRO A SALVAR']
    }, [posts, loadFailed])

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
            <div className="flex w-max animate-[mir-ticker_38s_linear_infinite] py-[7px] will-change-transform hover:[animation-play-state:paused] motion-reduce:animate-none">
                {line}
                {line}
            </div>
        </div>
    )
}

/* ---------- Nota que a pessoa escreveu ao salvar ---------- */
function ClaimNote({ text, className = '' }: { text: string; className?: string }) {
    return (
        <p
            className={`border-l-2 border-mir-acc/40 pl-3 text-[14px] italic leading-[1.5] ${className}`}
        >
            {text}
        </p>
    )
}

/* ---------- O drop de hoje (faixa em destaque) ---------- */
function DropCard({
    post,
    isAuthenticated,
}: {
    post: FeedPost
    isAuthenticated: boolean
}) {
    const { saved, count, busy, toggle } = useSave(post, isAuthenticated)
    const who = whoOf(post)
    const ord = ordLabel(post.position)

    return (
        <section className="relative overflow-hidden rounded-[18px] border border-mir-line2 bg-mir-surface p-6 sm:p-8">
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-mir-acc/[0.07] blur-3xl"
            />

            <div className="relative flex flex-wrap items-start gap-6 sm:gap-8">
                <Link href={trackHref(post)} className="block flex-none">
                    <Cover
                        seed={post.artist_name}
                        thumbnail={post.track_thumbnail}
                        size={200}
                        priority
                        className="h-[148px] w-[148px] rounded-xl shadow-[0_20px_44px_-20px_rgba(0,0,0,0.7)] transition-transform hover:-translate-y-1 sm:h-[180px] sm:w-[180px]"
                        iniClassName="text-[54px]"
                    />
                </Link>

                <div className="min-w-[260px] flex-1">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mir-acc">
                        O drop de hoje
                    </span>

                    <Link href={trackHref(post)} className="mt-3 block w-max max-w-full">
                        <h2 className="text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.02] tracking-[-0.035em] text-mir-text transition-colors hover:text-mir-acc">
                            {post.track_title}
                        </h2>
                    </Link>
                    <div className="mt-1 font-mono text-[13px] tracking-[0.04em] text-mir-text2">
                        {post.artist_name}
                    </div>

                    {post.claim_message ? (
                        <ClaimNote
                            text={post.claim_message}
                            className="mt-4 max-w-[52ch] text-mir-text2"
                        />
                    ) : (
                        <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.5] text-mir-text2">
                            <b className="font-semibold text-mir-text">{who}</b> achou
                            cedo e salvou {timeAgo(post.claimedat) || 'recentemente'}.
                        </p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                        <button
                            onClick={toggle}
                            disabled={busy || !isAuthenticated}
                            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14.5px] font-bold transition active:translate-y-px disabled:opacity-60 ${
                                saved
                                    ? 'border border-mir-line2 bg-transparent text-mir-text2 hover:border-mir-text3 hover:text-mir-text'
                                    : 'bg-mir-acc text-mir-on-acc hover:brightness-110'
                            }`}
                        >
                            {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {saved ? 'Salva no seu acervo' : 'Salvar agora'}
                        </button>
                        <span className="font-mono text-[12px] text-mir-text3">
                            {ord ? `${who} foi ${ord} a salvar · ` : ''}
                            {count} no acervo
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ---------- Item do feed ---------- */
function FeedItem({
    post,
    isAuthenticated,
}: {
    post: FeedPost
    isAuthenticated: boolean
}) {
    const { saved, count, busy, toggle } = useSave(post, isAuthenticated)

    const early = isEarly(post)
    const who = whoOf(post)
    const ord = ordLabel(post.position)

    return (
        <article className="grid grid-cols-[72px_1fr] gap-3.5 border-t border-mir-line py-[22px] sm:grid-cols-[88px_1fr] sm:gap-[18px]">
            <Link href={trackHref(post)} className="block">
                <Cover
                    seed={post.artist_name}
                    thumbnail={post.track_thumbnail}
                    size={96}
                    className="h-[72px] w-[72px] rounded-[9px] sm:h-[88px] sm:w-[88px]"
                    iniClassName="text-[24px] sm:text-[30px]"
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
                                // <img> cru de propósito: avatar de OAuth vem de
                                // domínios variados (googleusercontent etc.) que não
                                // estão liberados em next.config, e o otimizador
                                // quebraria em runtime. São 24px, não vale o risco.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={post.avatar_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                (who || 'U').charAt(0).toUpperCase()
                            )}
                        </span>
                        <span>
                            <b className="font-semibold text-mir-text">{who}</b> salvou
                        </span>
                    </Link>
                    <span className="text-mir-text3">·</span>
                    <span className="font-mono text-[11px] text-mir-text3">
                        {timeAgo(post.claimedat)}
                    </span>
                    {early && (
                        <span className="rounded border border-mir-acc/40 bg-mir-acc-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-mir-acc">
                            cedo
                        </span>
                    )}
                </div>

                <Link href={trackHref(post)} className="mt-2.5 block w-max max-w-full">
                    <h3 className="truncate text-[18px] font-bold leading-[1.15] tracking-[-0.015em] text-mir-text transition-colors hover:text-mir-acc">
                        {post.track_title}
                    </h3>
                </Link>
                <div className="mt-0.5 truncate text-[13.5px] text-mir-text2">
                    {post.artist_name}
                </div>

                {post.claim_message && (
                    <ClaimNote text={post.claim_message} className="mt-3 text-mir-text2" />
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="font-mono text-[11px] tracking-[0.03em] text-mir-text3">
                        {ord && (
                            <span
                                className={
                                    early
                                        ? 'font-semibold text-mir-acc'
                                        : 'font-semibold text-mir-text2'
                                }
                            >
                                {ord}{' '}
                            </span>
                        )}
                        {ord ? 'a salvar · ' : ''}
                        {count} também {count === 1 ? 'tem' : 'têm'}
                    </span>

                    <button
                        onClick={toggle}
                        disabled={busy || !isAuthenticated}
                        className={`ml-auto inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-[7px] text-[12.5px] font-semibold transition active:translate-y-px disabled:opacity-60 ${
                            saved
                                ? 'border border-mir-line2 bg-transparent text-mir-text2 hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text'
                                : 'bg-mir-acc text-mir-on-acc hover:brightness-[1.07]'
                        }`}
                    >
                        {saved ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {saved ? 'Salva' : 'Salvar'}
                    </button>
                </div>
            </div>
        </article>
    )
}

/* ---------- Entrada da Pilha ----------
   Faixa larga, uma só, entre o cabeçalho e o feed. É a porta da superfície
   de descoberta, então ganha tratamento de destaque: prévia das capas
   inclinadas à esquerda, que se abrem no hover, e um CTA pulsando. */
const TEASER_ROT = ['-9deg', '6deg', '-4deg', '10deg', '-6deg']

function PileBanner({ claims }: { claims: RecentClaim[] }) {
    const teasers = claims.slice(0, 5)
    const slots = teasers.length > 0 ? teasers : Array.from({ length: 4 })

    return (
        <Link
            href="/pilha"
            className="pile-band group relative mb-9 block overflow-hidden rounded-[18px] border border-mir-line2 bg-[#12100b] transition-colors hover:border-mir-acc/45"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-16 top-1/2 h-56 w-72 -translate-y-1/2 rounded-full bg-mir-acc/[0.09] blur-3xl"
            />

            <div className="relative flex flex-wrap items-center gap-x-7 gap-y-5 px-6 py-5 sm:px-8">
                <div className="relative hidden h-[84px] w-[214px] flex-none sm:block">
                    {slots.map((c: any, i) => (
                        <span
                            key={i}
                            // sem .mir-cover aqui de propósito: aquela classe força
                            // position:relative e tiraria as capas do posicionamento
                            // absoluto que monta o leque
                            className="pile-teaser absolute top-[5px] block h-[74px] w-[74px] overflow-hidden rounded-[3px] shadow-[0_10px_24px_-10px_rgba(0,0,0,0.9)]"
                            style={{
                                left: i * 35,
                                zIndex: i,
                                ['--tr' as string]: TEASER_ROT[i % 5],
                                background: tone(c?.artist_name || `p${i}`),
                            }}
                        >
                            <span className="absolute inset-0 grid select-none place-items-center text-[19px] font-extrabold tracking-[-0.05em] text-mir-text/15">
                                {initials(c?.artist_name || 'Mirsui')}
                            </span>
                            {c?.track_thumbnail && (
                                <Image
                                    src={c.track_thumbnail}
                                    alt=""
                                    width={96}
                                    height={96}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            )}
                        </span>
                    ))}
                </div>

                <div className="min-w-[220px] flex-1">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mir-acc">
                        A pilha
                    </span>
                    <p className="mt-2 text-[clamp(19px,2.2vw,25px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-mir-text">
                        Tudo que a cena já salvou, despejado num lugar só.
                    </p>
                    <p className="mt-1.5 font-mono text-[11.5px] leading-[1.5] tracking-[0.03em] text-mir-text3">
                        Capa grande, muita gente. Capa pequena, quase ninguém — ainda.
                    </p>
                </div>

                <span className="pile-cta inline-flex flex-none items-center gap-2 rounded-full bg-mir-acc px-6 py-3 text-[14px] font-bold text-mir-on-acc transition group-hover:brightness-110">
                    Revirar a pilha
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
            </div>
        </Link>
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
                Seu turno
            </span>
            <p className="mt-3 text-[22px] font-extrabold leading-[1.04] tracking-[-0.03em]">
                Salve o que você achou primeiro.
            </p>
            <p className="mt-2 font-mono text-[11.5px] leading-[1.5] text-mir-on-acc/70">
                Seu nome fica no histórico da faixa. Ouça cedo, prove o faro.
            </p>
            <span className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-mir-bg text-[13px] font-bold text-mir-acc">
                Salvar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
        </Link>
    )
}

/* ---------- Estado vazio ---------- */
function EmptyState({ title, body }: { title: string; body: string }) {
    return (
        <div className="mt-6 rounded-[13px] border border-dashed border-mir-line2 px-8 py-14 text-center">
            <p className="text-[17px] font-bold tracking-[-0.02em] text-mir-text">
                {title}
            </p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-[1.55] text-mir-text2">
                {body}
            </p>
        </div>
    )
}

/* ---------- Estado de erro ----------
   Separado do EmptyState de propósito: antes, falha de rede ou 429 do backend
   caía no vazio e a tela dizia que a cena estava parada. */
function ErrorState({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) {
    return (
        <div className="mt-6 rounded-[13px] border border-dashed border-mir-line2 px-8 py-14 text-center">
            <p className="text-[17px] font-bold tracking-[-0.02em] text-mir-text">
                Não conseguimos carregar a cena
            </p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-[1.55] text-mir-text2">
                O problema é do nosso lado, não seu. Nada foi perdido: os achados
                continuam salvos.
            </p>
            <button
                onClick={onRetry}
                disabled={retrying}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-mir-line2 px-6 py-2.5 font-mono text-[12px] uppercase tracking-[0.1em] text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text disabled:opacity-50"
            >
                {retrying ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <RotateCw className="h-3.5 w-3.5" />
                )}
                {retrying ? 'Tentando…' : 'Tentar de novo'}
            </button>
        </div>
    )
}

/* ---------- App ---------- */
export default function FeedContent({ initialPosts, recentClaims, currentUserId, loadFailed = false, recentClaimsFailed = false }: FeedContentProps) {
    const router = useRouter()
    const [retrying, startRetry] = useTransition()
    const retry = () => startRetry(() => router.refresh())
    const [posts, setPosts] = useState(initialPosts)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(initialPosts.length === 5)
    const [loadMoreFailed, setLoadMoreFailed] = useState(false)
    const [tab, setTab] = useState<'cena' | 'seguindo'>('cena')

    const isAuthenticated = !!currentUserId

    // Sem dados de "quem você segue" nesta carga; a aba fica preparada
    // para quando essa relação for fornecida pelo backend.
    const onCena = tab === 'cena'
    const drop = onCena ? posts[0] : undefined
    const feed = useMemo(() => (onCena ? posts.slice(1) : []), [onCena, posts])

    const loadMorePosts = async () => {
        setLoading(true)
        setLoadMoreFailed(false)
        try {
            const response = await fetch(`${BACKEND_URL}/feed?limit=5&offset=${posts.length}`)
            if (!response.ok) {
                // sem isto o clique não fazia nada visível e parecia botão quebrado
                console.error('Erro ao carregar mais achados:', response.status)
                setLoadMoreFailed(true)
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
            // append puro: a lista só cresce para baixo, então o scroll do
            // usuário não se move e não há posição para restaurar
            setPosts((current) => [...current, ...postsWithLikes])
            if (newPosts.length < 5) setHasMore(false)
        } catch (error) {
            console.error('Erro ao carregar mais achados:', error)
            setLoadMoreFailed(true)
        } finally {
            setLoading(false)
        }
    }

    const hasAny = posts.length > 0

    return (
        <div className="w-full">
            <Ticker posts={posts} loadFailed={loadFailed} />

            <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-10">
                {/* Cabeçalho: título e abas na mesma faixa, para o feed começar cedo */}
                <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pb-7 pt-10 sm:pt-12">
                    <div>
                        <span className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-mir-acc">
                            <span className="inline-block h-2 w-2 rounded-full bg-mir-acc animate-[mir-pulse_2s_infinite] motion-reduce:animate-none" />
                            A cena, ao vivo
                        </span>
                        <h1 className="mt-3 text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-mir-text">
                            Quem ouviu primeiro o quê.
                        </h1>
                    </div>

                    <div className="flex w-max gap-1 rounded-full border border-mir-line bg-mir-fill1 p-[3px]">
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

                <PileBanner claims={recentClaims} />

                <div className="grid grid-cols-1 items-start gap-[34px] pb-[70px] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-[46px]">
                    <section className="flex flex-col">
                        {drop && (
                            <div className="mb-9">
                                <DropCard post={drop} isAuthenticated={isAuthenticated} />
                            </div>
                        )}

                        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-1">
                            <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-mir-text">
                                Achados da cena
                            </h2>
                            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mir-text3">
                                {onCena ? 'A cena inteira' : 'Quem você segue'}
                            </span>
                        </div>

                        {loadFailed && posts.length === 0 ? (
                            <ErrorState onRetry={retry} retrying={retrying} />
                        ) : feed.length > 0 ? (
                            <>
                                {feed.map((post) => (
                                    <FeedItem key={post.id} post={post} isAuthenticated={isAuthenticated} />
                                ))}

                                {onCena && hasMore && (
                                    <div className="flex flex-col items-center gap-2.5 pt-7">
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
                                            ) : loadMoreFailed ? (
                                                <>
                                                    <RotateCw className="h-3.5 w-3.5" />
                                                    Tentar de novo
                                                </>
                                            ) : (
                                                'Carregar mais achados'
                                            )}
                                        </button>
                                        {loadMoreFailed && !loading && (
                                            <p className="font-mono text-[11px] text-mir-text3">
                                                não deu pra buscar agora
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : !onCena ? (
                            <EmptyState
                                title="Você ainda não segue ninguém"
                                body="Quando você seguir outros ouvintes, o que eles salvarem aparece aqui, separado do barulho da cena inteira."
                            />
                        ) : (
                            <EmptyState
                                title={
                                    hasAny
                                        ? 'Por enquanto, só o drop de hoje'
                                        : 'O radar ainda está em silêncio'
                                }
                                body={
                                    hasAny
                                        ? 'A cena está quieta agora. Volte mais tarde para os próximos achados.'
                                        : 'Ninguém salvou nada ainda. Seja o primeiro e seu nome abre o histórico da faixa.'
                                }
                            />
                        )}
                    </section>

                    <aside className="flex flex-col gap-[22px] lg:sticky lg:top-[92px]">
                        <RecentClaims claims={recentClaims} loadFailed={recentClaimsFailed} />
                        <FaroCard />
                    </aside>
                </div>
            </div>
        </div>
    )
}
