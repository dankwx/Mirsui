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
    return (
        <div className="min-h-screen bg-muted">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                    {/* Main Feed - 8 colunas em telas grandes */}
                    <div className="lg:col-span-8 space-y-6">
                            {/* Header */}
                            <div className="text-center py-6">
                                <h1 className="text-3xl font-bold text-foreground mb-2">
                                    Mirsui Feed
                                </h1>
                                <p className="text-muted-foreground">
                                    Descobertas musicais da comunidade em tempo real
                                </p>
                            </div>

                            {/* Posts */}
                            <div className="space-y-6">
                                {initialPosts.length > 0 ? (
                                    initialPosts.map((post) => (
                                        <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                                            <CardContent className="p-6">
                                                {/* Header do Post */}
                                                <div className="flex items-start gap-3 mb-4">
                                                    <Avatar className="h-12 w-12">
                                                        {post.avatar_url ? (
                                                            <AvatarImage src={post.avatar_url} alt={post.username} />
                                                        ) : null}
                                                        <AvatarFallback className="text-lg bg-purple-600/10 text-purple-600">
                                                            {(post.display_name || post.username || 'U').charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Link 
                                                                href={`/user/${post.username}`}
                                                                className="font-semibold hover:underline text-foreground"
                                                            >
                                                                {post.display_name || post.username}
                                                            </Link>
                                                            {isUserVerified(post.position) && (
                                                                <Crown className="h-4 w-4 text-amber-500" />
                                                            )}
                                                            <Badge variant="secondary" className="text-xs">
                                                                {getUserBadge(post.position, post.discover_rating || undefined)}
                                                            </Badge>
                                                            <span className="text-muted-foreground">•</span>
                                                            <span className="text-muted-foreground text-sm">
                                                                {post.claimedat ? new Date(post.claimedat).toLocaleDateString('pt-BR') : 'Data não disponível'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Target className="h-4 w-4 text-purple-600" />
                                                            <span className="text-muted-foreground text-sm">
                                                                reivindicou uma música
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Conteúdo da música */}
                                                <div className="bg-muted rounded-xl p-4 mb-4 border border-border">
                                                    <div className="flex items-center gap-4">
                                                        {post.track_thumbnail && (
                                                            <img
                                                                src={post.track_thumbnail}
                                                                alt={`Capa de ${post.track_title}`}
                                                                className="h-16 w-16 rounded-lg shadow-md"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-lg text-foreground">
                                                                <Link 
                                                                    href={`/track/${post.track_url?.split('/').pop() || post.track_title}`}
                                                                    className="hover:underline"
                                                                >
                                                                    {post.track_title}
                                                                </Link>
                                                            </h3>
                                                            <p className="text-muted-foreground">
                                                                {post.artist_name}
                                                            </p>
                                                            {post.album_name && (
                                                                <p className="text-muted-foreground text-sm">
                                                                    {post.album_name}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                                <div className="flex items-center gap-1">
                                                                    <Award className="h-4 w-4" />
                                                                    <span>#{post.position}</span>
                                                                </div>
                                                                {post.popularity && (
                                                                    <div className="flex items-center gap-1">
                                                                        <TrendingUp className="h-4 w-4" />
                                                                        <span>{post.popularity}% popularidade</span>
                                                                    </div>
                                                                )}
                                                                {post.discover_rating && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Sparkles className="h-4 w-4" />
                                                                        <span>{post.discover_rating}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Mensagem do usuário */}
                                                {post.claim_message && (
                                                    <div className="mb-4">
                                                        <p className="text-foreground italic">
                                                            &quot;{post.claim_message}&quot;
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Tags */}
                                                <div className="flex gap-2 mb-4">
                                                    {post.position === 1 && (
                                                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                                            primeiro-claim
                                                        </Badge>
                                                    )}
                                                    {post.position <= 10 && (
                                                        <Badge variant="outline" className="text-xs bg-purple-600/10 text-purple-600 border-purple-600/30">
                                                            early-bird
                                                        </Badge>
                                                    )}
                                                    {post.discover_rating && post.discover_rating > 8 && (
                                                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                                                            high-potential
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Interações sociais */}
                                                <PostInteractions 
                                                    trackId={post.id}
                                                    initialLikesCount={post.likes_count}
                                                    initialCommentsCount={post.comments_count}
                                                    initialIsLiked={post.isLiked}
                                                />
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Card className="text-center py-12">
                                        <CardContent>
                                            <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                                Nenhuma atividade ainda
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                Seja o primeiro a reivindicar uma música e aparecer no feed!
                                            </p>
                                            <Link href="/claimtrack">
                                                <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                                                    <Plus className="h-4 w-4" />
                                                    Reivindicar Música
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                    </div>

                    {/* Sidebar - Reivindicações Recentes - 4 colunas em telas grandes */}
                    <div className="lg:col-span-4">
                        <RecentClaims claims={recentClaims} />
                    </div>
                </div>
            </div>
        </div>
    )
}