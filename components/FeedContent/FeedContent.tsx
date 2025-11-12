import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    TrendingUp,
    Music,
    Sparkles,
    Crown,
    Plus,
    Award,
    Target
} from 'lucide-react'
import PostInteractions from '@/components/PostInteractions/PostInteractions'
import { FeedPostWithInteractions } from '@/utils/socialInteractionsService'
import { getUserBadge, isUserVerified } from '@/utils/feedHelpers'
import Link from 'next/link'
import RecentClaims from '@/components/RecentClaims/RecentClaims'
import { RecentClaim } from '@/utils/recentClaimsService'

interface FeedContentProps {
    initialPosts: (FeedPostWithInteractions & { isLiked: boolean })[]
    recentClaims: RecentClaim[]
}

// Server Component otimizado para feed
export default function FeedContent({ initialPosts, recentClaims }: FeedContentProps) {
    const totalPosts = initialPosts.length

    const formatClaimDate = (claimedat?: string | null) => {
        if (!claimedat) return 'Data não disponível'
        try {
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }).format(new Date(claimedat))
        } catch {
            return 'Data não disponível'
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#05030f] text-slate-100">
            <div className="pointer-events-none absolute -left-48 top-16 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,92,255,0.16),_transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-40 bottom-0 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,113,181,0.16),_transparent_70%)] blur-3xl" />

            <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-6 lg:px-8">
                <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/40">

                            <span>feed</span>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-[2.75rem]">
                                Descobertas que estão prestes a explodir
                            </h1>
                            <p className="max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
                                Acompanhe em tempo real as capturas de faixa da comunidade, avalie a energia de cada aposta e se inspire nas profecias musicais que chegam primeiro aqui.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-white/45">
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-1">
                                {totalPosts} histórias recentes
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-1">
                                curadores ativos
                            </span>
                        </div>
                    </div>
                    <Button asChild className="h-11 rounded-full border border-white/10 bg-gradient-to-r from-purple-500 to-pink-500 px-6 text-sm font-medium shadow-[0_16px_42px_rgba(132,94,255,0.3)] transition hover:from-purple-600 hover:to-pink-600">
                        <Link href="/claimtrack" className="flex items-center gap-2 uppercase tracking-[0.28em]">
                            <Plus className="h-4 w-4" />
                            Registrar descoberta
                        </Link>
                    </Button>
                </header>

                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="space-y-8">
                        {initialPosts.length > 0 ? (
                            <ul className="relative space-y-8">
                                <span className="pointer-events-none absolute left-5 top-0 bottom-0 hidden w-px bg-white/10 lg:block" />
                                {initialPosts.map((post, index) => (
                                    <li key={post.id} className="relative pl-2 pr-2 lg:pl-14">
                                        <span className={`pointer-events-none absolute left-[18px] top-8 h-3 w-3 rounded-full ring-4 ring-[#05030f] lg:left-5 ${index % 3 === 0
                                                ? 'bg-purple-400'
                                                : index % 3 === 1
                                                    ? 'bg-pink-400'
                                                    : 'bg-blue-400'
                                            }`} />
                                        <article className="group flex flex-col gap-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_22px_52px_rgba(8,4,20,0.32)] transition hover:border-white/25 hover:bg-white/[0.07] lg:p-7">
                                            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                                <div className="flex flex-1 items-start gap-4">
                                                    <Avatar className="h-12 w-12 rounded-2xl border border-white/10 bg-white/10">
                                                        {post.avatar_url ? (
                                                            <AvatarImage src={post.avatar_url} alt={post.username} />
                                                        ) : null}
                                                        <AvatarFallback className="rounded-2xl bg-purple-600/20 text-base font-semibold text-purple-200">
                                                            {(post.display_name || post.username || 'U')
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Link
                                                                href={`/user/${post.username}`}
                                                                className="text-lg font-semibold tracking-tight text-white transition hover:text-purple-300"
                                                            >
                                                                {post.display_name || post.username}
                                                            </Link>
                                                            {isUserVerified(post.position) && (
                                                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-amber-200">
                                                                    <Crown className="h-3 w-3" />
                                                                    Curador destaque
                                                                </span>
                                                            )}
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/55">
                                                                {getUserBadge(post.position, post.discover_rating || undefined)}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/45">
                                                            <Target className="h-3.5 w-3.5 text-purple-300" />
                                                            <span>reivindicou uma faixa</span>
                                                            <span>•</span>
                                                            <span>{formatClaimDate(post.claimedat)}</span>
                                                            <span>•</span>
                                                            <span className="text-white/55">#{post.position ?? '—'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {typeof post.discover_rating === 'number' && (
                                                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/65">
                                                        <Award className="h-3.5 w-3.5 text-purple-300" />
                                                        score {post.discover_rating}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:gap-6">
                                                {post.track_thumbnail && (
                                                    <img
                                                        src={post.track_thumbnail}
                                                        alt={`Capa de ${post.track_title}`}
                                                        className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover shadow-[0_12px_30px_rgba(12,9,32,0.6)]"
                                                    />
                                                )}
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <Link
                                                            href={`/track/${post.track_url?.split('/').pop() || post.track_title}`}
                                                            className="text-2xl font-semibold tracking-tight text-white transition hover:text-purple-300"
                                                        >
                                                            {post.track_title}
                                                        </Link>
                                                        <p className="text-sm text-white/60">{post.artist_name}</p>
                                                        {post.album_name && (
                                                            <p className="text-[11px] uppercase tracking-[0.35em] text-white/35">
                                                                {post.album_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 text-sm text-white/65">
                                                        {typeof post.popularity === 'number' && (
                                                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                                                                <TrendingUp className="h-4 w-4 text-purple-300" />
                                                                {post.popularity}% hype atual
                                                            </span>
                                                        )}
                                                        {typeof post.discover_rating === 'number' && (
                                                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                                                                <Sparkles className="h-4 w-4 text-pink-300" />
                                                                potencial {post.discover_rating}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {post.claim_message && (
                                                <blockquote className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm italic text-white/65">
                                                    &ldquo;{post.claim_message}&rdquo;
                                                </blockquote>
                                            )}

                                            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.28em] text-white/55">
                                                {post.position === 1 && (
                                                    <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-amber-200">
                                                        primeiro-claim
                                                    </span>
                                                )}
                                                {typeof post.position === 'number' && post.position <= 10 && (
                                                    <span className="rounded-full border border-purple-300/40 bg-purple-300/10 px-3 py-1 text-purple-200">
                                                        early-bird
                                                    </span>
                                                )}
                                                {typeof post.discover_rating === 'number' && post.discover_rating >= 8 && (
                                                    <span className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-emerald-200">
                                                        high-potential
                                                    </span>
                                                )}
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                                                <PostInteractions
                                                    trackId={post.id}
                                                    initialLikesCount={post.likes_count}
                                                    initialCommentsCount={post.comments_count}
                                                    initialIsLiked={post.isLiked}
                                                />
                                            </div>
                                        </article>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.02] px-8 py-14 text-center">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                                    <Music className="h-7 w-7 text-purple-300" />
                                </div>
                                <h3 className="text-2xl font-semibold text-white">
                                    O radar ainda está em silêncio
                                </h3>
                                <p className="mt-2 text-sm text-white/60">
                                    Seja a primeira pessoa a reivindicar uma faixa promissora e inaugure esta linha do tempo.
                                </p>
                                <Button asChild className="mt-6 rounded-full border border-white/10 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-[0_14px_38px_rgba(137,97,255,0.3)] hover:from-purple-600 hover:to-pink-600">
                                    <Link href="/claimtrack" className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        iniciar hype
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </section>

                    <aside className="lg:sticky lg:top-28">
                        <RecentClaims claims={recentClaims} />
                    </aside>
                </div>
            </div>
        </div>
    )
}