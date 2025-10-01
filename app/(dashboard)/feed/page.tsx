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
import GetLatestClaims from '@/components/GetLatestClaims/GetLatestClaims'
import DiscoveryStats from '@/components/DiscoveryStats/DiscoveryStats'
import PostInteractions from '@/components/PostInteractions/PostInteractions'
import { getFeedPostsWithInteractions, checkUserLikedTrack } from '@/utils/socialInteractionsService'
import { createClient } from '@/utils/supabase/server'
import { getUserBadge, isUserVerified } from '@/utils/feedService'
import Link from 'next/link'

export default async function FeedPage() {
    const supabase = createClient()
    
    // Buscar dados do usuário
    const { data: { user } } = await supabase.auth.getUser()
    
    // Buscar posts do feed
    const feedPosts = await getFeedPostsWithInteractions(20, 0)
    
    // Para cada post, verificar se o usuário logado curtiu
    const postsWithLikes = await Promise.all(
        feedPosts.map(async (post) => {
            let isLiked = false
            if (user) {
                isLiked = await checkUserLikedTrack(post.id, user.id)
            }
            return { ...post, isLiked }
        })
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {/* Discovery Stats */}
                            <DiscoveryStats />
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="text-center py-6">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    🎵 SoundSage Feed
                                </h1>
                                <p className="text-gray-600">
                                    Descobertas musicais da comunidade em tempo real
                                </p>
                            </div>

                            {/* Posts */}
                            <div className="space-y-6">
                                {postsWithLikes.length > 0 ? (
                                    postsWithLikes.map((post) => (
                                        <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                                            <CardContent className="p-6">
                                                {/* Header do Post */}
                                                <div className="flex items-start gap-3 mb-4">
                                                    <Avatar className="h-12 w-12">
                                                        {post.avatar_url ? (
                                                            <AvatarImage src={post.avatar_url} alt={post.username} />
                                                        ) : null}
                                                        <AvatarFallback className="text-lg bg-purple-100">
                                                            {(post.display_name || post.username || 'U').charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Link 
                                                                href={`/user/${post.username}`}
                                                                className="font-semibold hover:underline"
                                                            >
                                                                {post.display_name || post.username}
                                                            </Link>
                                                            {isUserVerified(post.position) && (
                                                                <Crown className="h-4 w-4 text-yellow-500" />
                                                            )}
                                                            <Badge variant="secondary" className="text-xs">
                                                                {getUserBadge(post.position, post.discover_rating || undefined)}
                                                            </Badge>
                                                            <span className="text-gray-500">•</span>
                                                            <span className="text-gray-500 text-sm">
                                                                {post.claimedat ? new Date(post.claimedat).toLocaleDateString('pt-BR') : 'Data não disponível'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Target className="h-4 w-4 text-purple-500" />
                                                            <span className="text-gray-600 text-sm">
                                                                reivindicou uma música
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Conteúdo da música */}
                                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
                                                    <div className="flex items-center gap-4">
                                                        {post.track_thumbnail && (
                                                            <img
                                                                src={post.track_thumbnail}
                                                                alt={`Capa de ${post.track_title}`}
                                                                className="h-16 w-16 rounded-lg shadow-md"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-lg">
                                                                <Link 
                                                                    href={`/track/${post.track_url?.split('/').pop() || post.track_title}`}
                                                                    className="hover:underline"
                                                                >
                                                                    {post.track_title}
                                                                </Link>
                                                            </h3>
                                                            <p className="text-gray-600">
                                                                {post.artist_name}
                                                            </p>
                                                            {post.album_name && (
                                                                <p className="text-gray-500 text-sm">
                                                                    {post.album_name}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                                                                        <span>{post.discover_rating}/10 descoberta</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Mensagem do usuário */}
                                                {post.claim_message && (
                                                    <div className="mb-4">
                                                        <p className="text-gray-700 italic">
                                                            &quot;{post.claim_message}&quot;
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Tags */}
                                                <div className="flex gap-2 mb-4">
                                                    {post.position === 1 && (
                                                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            primeiro-claim
                                                        </Badge>
                                                    )}
                                                    {post.position <= 10 && (
                                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                                            early-bird
                                                        </Badge>
                                                    )}
                                                    {post.discover_rating && post.discover_rating > 8 && (
                                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
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
                                            <Music className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                                Nenhuma atividade ainda
                                            </h3>
                                            <p className="text-gray-500 mb-4">
                                                Seja o primeiro a reivindicar uma música e aparecer no feed!
                                            </p>
                                            <Link href="/claimtrack">
                                                <Button className="gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    Reivindicar Música
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {/* Latest Claims */}
                            <GetLatestClaims />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}