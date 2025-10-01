import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    TrendingUp, 
    Music, 
    Sparkles,
    Crown,
    Plus,
    Zap,
    Award,
    Target
} from 'lucide-react'
import GetLatestClaims from '@/components/GetLatestClaims/GetLatestClaims'
import DiscoveryStats from '@/components/DiscoveryStats/DiscoveryStats'
import { getFeedPosts, formatTimestamp, getUserBadge, isUserVerified } from '@/utils/feedService'
import Link from 'next/link'

export default async function FeedPage() {
    // Buscar posts reais do feed
    const feedPosts = await getFeedPosts(20)

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {/* User Info */}
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
                                <CardContent className="p-6">
                                    <div className="text-center">
                                        <Avatar className="h-16 w-16 mx-auto mb-4">
                                            <AvatarFallback className="text-2xl bg-purple-100">
                                                🎵
                                            </AvatarFallback>
                                        </Avatar>
                                        <h3 className="font-semibold text-lg">Seu Feed Musical</h3>
                                        <p className="text-gray-600 text-sm">
                                            Descubra as últimas reivindicações da comunidade
                                        </p>
                                        <Link href="/claimtrack">
                                            <Button className="w-full mt-4 gap-2">
                                                <Plus className="h-4 w-4" />
                                                Reivindicar Música
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Discovery Stats */}
                            <DiscoveryStats />
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                    Feed Musical
                                </h1>
                                <p className="text-gray-600">
                                    Acompanhe as descobertas mais recentes da comunidade
                                </p>
                            </div>

                            {/* Posts */}
                            <div className="space-y-6">
                                {feedPosts.length > 0 ? (
                                    feedPosts.map((post) => (
                                        <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                                            <CardContent className="p-6">
                                                {/* Header do Post */}
                                                <div className="flex items-start gap-3 mb-4">
                                                    <Avatar className="h-12 w-12">
                                                        {post.user.avatar_url ? (
                                                            <AvatarImage src={post.user.avatar_url} alt={post.user.username} />
                                                        ) : null}
                                                        <AvatarFallback className="text-lg bg-purple-100">
                                                            {post.user.username.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Link 
                                                                href={`/user/${post.user.username}`}
                                                                className="font-semibold hover:underline"
                                                            >
                                                                {post.user.display_name || post.user.username}
                                                            </Link>
                                                            {isUserVerified(post.track.position) && (
                                                                <Crown className="h-4 w-4 text-yellow-500" />
                                                            )}
                                                            <Badge variant="secondary" className="text-xs">
                                                                {getUserBadge(post.track.position, post.discover_rating)}
                                                            </Badge>
                                                            <span className="text-gray-500">•</span>
                                                            <span className="text-gray-500 text-sm">
                                                                {formatTimestamp(post.timestamp)}
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
                                                        {post.track.track_thumbnail && (
                                                            <img
                                                                src={post.track.track_thumbnail}
                                                                alt={`Capa de ${post.track.title}`}
                                                                className="h-16 w-16 rounded-lg shadow-md"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-lg">
                                                                <Link 
                                                                    href={`/track/${post.track.track_url?.split('/').pop() || post.track.title}`}
                                                                    className="hover:underline"
                                                                >
                                                                    {post.track.title}
                                                                </Link>
                                                            </h3>
                                                            <p className="text-gray-600">
                                                                {post.track.artist}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                                <div className="flex items-center gap-1">
                                                                    <Award className="h-4 w-4" />
                                                                    <span>#{post.track.position}</span>
                                                                </div>
                                                                {post.track.popularity && (
                                                                    <div className="flex items-center gap-1">
                                                                        <TrendingUp className="h-4 w-4" />
                                                                        <span>{post.track.popularity}% popularidade</span>
                                                                    </div>
                                                                )}
                                                                {post.discover_rating && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Sparkles className="h-4 w-4" />
                                                                        <span>{post.discover_rating.toFixed(1)} discover</span>
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
                                                    {post.track.position === 1 && (
                                                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            primeiro-claim
                                                        </Badge>
                                                    )}
                                                    {post.track.position <= 10 && (
                                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                                            early-bird
                                                        </Badge>
                                                    )}
                                                    {post.discover_rating && post.discover_rating > 90 && (
                                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                            high-potential
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Actions simplificadas */}
                                                <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                                                    <Button variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-purple-600">
                                                        <Heart className="h-4 w-4" />
                                                        <span className="text-sm">Curtir</span>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-blue-600">
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span className="text-sm">Comentar</span>
                                                    </Button>
                                                </div>
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
