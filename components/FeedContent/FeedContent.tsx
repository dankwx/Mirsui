import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
        <div className="min-h-screen bg-gradient-to-b from-background via-muted/40 to-background">
            <div className="container mx-auto max-w-7xl px-4 py-12 pb-16 lg:px-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-2xl font-semibold text-foreground">Linha do tempo</h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Music className="h-4 w-4" />
                                <span>{totalPosts > 0 ? `${totalPosts}` : '0'}</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {initialPosts.length > 0 ? (
                                initialPosts.map((post) => (
                                    <Card
                                        key={post.id}
                                        className="border border-border/70 bg-card/95 shadow-xl shadow-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                                    >
                                        <CardContent className="p-0">
                                            <div className="flex flex-col gap-6 p-6">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <Avatar className="h-12 w-12">
                                                            {post.avatar_url ? (
                                                                <AvatarImage src={post.avatar_url} alt={post.username} />
                                                            ) : null}
                                                            <AvatarFallback className="text-lg bg-purple-600/10 text-purple-600">
                                                                {(post.display_name || post.username || 'U').charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Link
                                                                    href={`/user/${post.username}`}
                                                                    className="font-semibold text-foreground transition-colors hover:text-purple-600"
                                                                >
                                                                    {post.display_name || post.username}
                                                                </Link>
                                                                {isUserVerified(post.position) && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600">
                                                                        <Crown className="h-3 w-3" />
                                                                        Curador destaque
                                                                    </span>
                                                                )}
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {getUserBadge(post.position, post.discover_rating || undefined)}
                                                                </Badge>
                                                            </div>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                                <Target className="h-3.5 w-3.5 text-purple-600" />
                                                                <span>reivindicou uma faixa</span>
                                                                <span className="text-muted-foreground/60">•</span>
                                                                <span>{formatClaimDate(post.claimedat)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                                        <Award className="h-3.5 w-3.5" />
                                                        #{post.position ?? '—'}
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                                        {post.track_thumbnail && (
                                                            <img
                                                                src={post.track_thumbnail}
                                                                alt={`Capa de ${post.track_title}`}
                                                                className="h-20 w-20 rounded-xl object-cover shadow-md"
                                                            />
                                                        )}
                                                        <div className="flex-1 space-y-2">
                                                            <div>
                                                                <Link
                                                                    href={`/track/${post.track_url?.split('/').pop() || post.track_title}`}
                                                                    className="text-xl font-semibold text-foreground transition-colors hover:text-purple-600"
                                                                >
                                                                    {post.track_title}
                                                                </Link>
                                                                <p className="text-sm text-muted-foreground">{post.artist_name}</p>
                                                                {post.album_name && (
                                                                    <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
                                                                        {post.album_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                                {typeof post.popularity === 'number' && (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <TrendingUp className="h-4 w-4" />
                                                                        {post.popularity}% popularidade
                                                                    </span>
                                                                )}
                                                                {typeof post.discover_rating === 'number' && (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <Sparkles className="h-4 w-4" />
                                                                        {post.discover_rating}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {post.claim_message && (
                                                    <div className="rounded-2xl bg-card/80 px-5 py-4 text-sm italic text-muted-foreground">
                                                        &quot;{post.claim_message}&quot;
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-2">
                                                    {post.position === 1 && (
                                                        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-xs text-amber-600">
                                                            primeiro-claim
                                                        </Badge>
                                                    )}
                                                    {typeof post.position === 'number' && post.position <= 10 && (
                                                        <Badge variant="outline" className="border-purple-500/40 bg-purple-600/10 text-xs text-purple-600">
                                                            early-bird
                                                        </Badge>
                                                    )}
                                                    {typeof post.discover_rating === 'number' && post.discover_rating >= 8 && (
                                                        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-600">
                                                            high-potential
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="border-t border-border/70 bg-card/80 px-6 py-4">
                                                <PostInteractions
                                                    trackId={post.id}
                                                    initialLikesCount={post.likes_count}
                                                    initialCommentsCount={post.comments_count}
                                                    initialIsLiked={post.isLiked}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card className="border border-border/70 bg-card/90 py-12 text-center shadow-lg">
                                    <CardContent>
                                        <Music className="mb-4 h-12 w-12 mx-auto text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-semibold text-foreground">Nenhuma atividade ainda</h3>
                                        <p className="mb-6 text-sm text-muted-foreground">
                                            Seja o primeiro a reivindicar uma música e aparecer no feed!
                                        </p>
                                        <Button asChild size="lg" className="gap-2 bg-purple-600 text-white hover:bg-purple-700">
                                            <Link href="/claimtrack">
                                                <Plus className="h-4 w-4" />
                                                Reivindicar música
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <RecentClaims claims={recentClaims} />
                    </div>
                </div>
            </div>
        </div>
    )
}