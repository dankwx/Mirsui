'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    Play, 
    TrendingUp, 
    Music, 
    Sparkles,
    Crown,
    Flame,
    Users,
    Clock,
    Plus,
    Search,
    Filter,
    Zap,
    Award,
    Target,
    Headphones,
    Volume2
} from 'lucide-react'
import { motion } from 'framer-motion'
import GetLatestClaims from '@/components/GetLatestClaims/GetLatestClaims'
import StoryComponent from '@/components/Story/Story'
import DiscoveryStats from '@/components/DiscoveryStats/DiscoveryStats'

// Mock data para o feed
const feedPosts = [
    {
        id: 1,
        user: {
            username: 'musiclover_23',
            avatar: '🎵',
            isVerified: true,
            badge: 'Hipster Legend'
        },
        type: 'claim',
        track: {
            title: 'Blinding Lights',
            artist: 'The Weeknd',
            image: 'https://i.scdn.co/image/ab67616d0000b273a91c10e5e4b8868c0e9c18a1',
            position: 1,
            discoverRating: 95.2
        },
        timestamp: '2h',
        likes: 42,
        comments: 8,
        shares: 12,
        message: 'Essa vai explodir! Marquem minhas palavras 🔥',
        isLiked: false,
        tags: ['first-claim', 'early-bird']
    },
    {
        id: 2,
        user: {
            username: 'vinylhunter',
            avatar: '🎧',
            isVerified: false,
            badge: 'Crate Digger'
        },
        type: 'playlist',
        playlist: {
            title: 'Hidden Gems from 2024',
            trackCount: 23,
            image: 'https://i.scdn.co/image/ab67616d0000b2736eb0b9a73963ad71e4417971'
        },
        timestamp: '4h',
        likes: 156,
        comments: 23,
        shares: 45,
        message: 'Criei uma playlist com todas as gems que descobri antes de virarem hit. Qual vocês já conheciam?',
        isLiked: true,
        tags: ['playlist', 'gems']
    },
    {
        id: 3,
        user: {
            username: 'trendsetter',
            avatar: '✨',
            isVerified: true,
            badge: 'Taste Maker'
        },
        type: 'milestone',
        achievement: {
            type: 'first_viral',
            track: 'Flowers',
            artist: 'Miley Cyrus',
            achievement: 'Primeiro a claimar antes de virar #1'
        },
        timestamp: '6h',
        likes: 289,
        comments: 67,
        shares: 89,
        message: 'Quem disse que eu não tenho bom gosto? 😎 Claimei essa quando ainda tinha 2% de popularidade!',
        isLiked: false,
        tags: ['milestone', 'viral-hit']
    },
    {
        id: 4,
        user: {
            username: 'indiekid',
            avatar: '🎸',
            isVerified: false,
            badge: 'Underground'
        },
        type: 'discovery',
        track: {
            title: 'Paint The Town Red',
            artist: 'Doja Cat',
            image: 'https://i.scdn.co/image/ab67616d0000b273e3a5eafa35c55d1b7b50d8bc',
            position: 5,
            discoverRating: 88.7
        },
        timestamp: '8h',
        likes: 73,
        comments: 15,
        shares: 28,
        message: 'Galera, acabei de descobrir essa pérola! O algoritmo ainda não pegou, então é nossa chance 🚀',
        isLiked: true,
        tags: ['discovery', 'algorithm-miss']
    }
]

const stories = [
    { id: 1, user: 'musiclover_23', avatar: '🎵', hasNew: true, type: 'claim' },
    { id: 2, user: 'vinylhunter', avatar: '🎧', hasNew: true, type: 'playlist' },
    { id: 3, user: 'trendsetter', avatar: '✨', hasNew: false, type: 'milestone' },
    { id: 4, user: 'indiekid', avatar: '🎸', hasNew: true, type: 'discovery' },
    { id: 5, user: 'beatfinder', avatar: '🔍', hasNew: false, type: 'claim' },
    { id: 6, user: 'soundhunter', avatar: '🎯', hasNew: true, type: 'viral' }
]

const trendingTracks = [
    { title: 'Paint The Town Red', artist: 'Doja Cat', claims: 1247, trend: '+45%' },
    { title: 'Flowers', artist: 'Miley Cyrus', claims: 2156, trend: '+67%' },
    { title: 'Unholy', artist: 'Sam Smith', claims: 987, trend: '+23%' },
    { title: 'Anti-Hero', artist: 'Taylor Swift', claims: 3421, trend: '+89%' }
]

const PostCard = ({ post }: { post: any }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked)
    const [likes, setLikes] = useState(post.likes)

    const handleLike = () => {
        setIsLiked(!isLiked)
        setLikes(isLiked ? likes - 1 : likes + 1)
    }

    const getPostIcon = () => {
        switch (post.type) {
            case 'claim': return <Target className="h-4 w-4 text-purple-500" />
            case 'playlist': return <Music className="h-4 w-4 text-green-500" />
            case 'milestone': return <Award className="h-4 w-4 text-yellow-500" />
            case 'discovery': return <Zap className="h-4 w-4 text-blue-500" />
            default: return <Music className="h-4 w-4" />
        }
    }

    const getPostTypeText = () => {
        switch (post.type) {
            case 'claim': return 'claimou uma música'
            case 'playlist': return 'criou uma playlist'
            case 'milestone': return 'conquistou um marco'
            case 'discovery': return 'descobriu uma gem'
            default: return 'fez um post'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                    {/* Header do Post */}
                    <div className="flex items-start gap-3 mb-4">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-lg">
                                {post.user.avatar}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{post.user.username}</span>
                                {post.user.isVerified && <Crown className="h-4 w-4 text-yellow-500" />}
                                <Badge variant="secondary" className="text-xs">
                                    {post.user.badge}
                                </Badge>
                                <span className="text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{post.timestamp}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                {getPostIcon()}
                                <span>{getPostTypeText()}</span>
                                <div className="flex gap-1 ml-2">
                                    {post.tags.map((tag: string) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo do Post */}
                    <div className="mb-4">
                        <p className="text-gray-800 mb-3">{post.message}</p>
                        
                        {/* Track/Playlist/Achievement Card */}
                        {post.track && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img 
                                            src={post.track.image} 
                                            alt={post.track.title}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <Play className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{post.track.title}</h4>
                                        <p className="text-gray-600">{post.track.artist}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Badge className="bg-purple-100 text-purple-700">
                                                #{post.track.position} Claim
                                            </Badge>
                                            <div className="flex items-center gap-1 text-sm">
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                <span className="font-medium">{post.track.discoverRating}% Discover Rating</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {post.playlist && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img 
                                            src={post.playlist.image} 
                                            alt={post.playlist.title}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                            <Music className="h-3 w-3" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{post.playlist.title}</h4>
                                        <p className="text-gray-600">{post.playlist.trackCount} músicas</p>
                                        <Badge className="bg-green-100 text-green-700 mt-2">
                                            Playlist Curada
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}

                        {post.achievement && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                                <div className="flex items-center gap-3">
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <Award className="h-8 w-8 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-yellow-800">Conquista Desbloqueada!</h4>
                                        <p className="text-yellow-700">{post.achievement.achievement}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {post.achievement.track} - {post.achievement.artist}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ações do Post */}
                    <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={handleLike}
                                className={`flex items-center gap-2 hover:text-red-500 transition-colors ${
                                    isLiked ? 'text-red-500' : 'text-gray-500'
                                }`}
                            >
                                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-sm font-medium">{likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                                <MessageCircle className="h-5 w-5" />
                                <span className="text-sm font-medium">{post.comments}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                                <Share2 className="h-5 w-5" />
                                <span className="text-sm font-medium">{post.shares}</span>
                            </button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                            <Headphones className="h-4 w-4 mr-1" />
                            Ouvir
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default function FeedPage() {
    const [filter, setFilter] = useState('all')

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Music Feed
                            </h1>
                            <p className="text-gray-600">
                                Descubra o que os hipsters estão ouvindo agora
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" size="sm">
                                <Search className="h-4 w-4 mr-2" />
                                Buscar
                            </Button>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar Esquerda */}
                    <div className="space-y-6">
                        {/* Stories */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    Stories
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <StoryComponent />
                            </CardContent>
                        </Card>

                        {/* Discovery Stats */}
                        <DiscoveryStats />
                    </div>

                    {/* Feed Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Create Post */}
                        <Card className="border-2 border-dashed border-purple-200 hover:border-purple-300 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>🎵</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <Input 
                                            placeholder="Descobriu alguma gem hoje? Compartilhe com a galera!"
                                            className="border-0 bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Postar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[
                                { key: 'all', label: 'Todos', icon: Music },
                                { key: 'claims', label: 'Claims', icon: Target },
                                { key: 'playlists', label: 'Playlists', icon: Music },
                                { key: 'discoveries', label: 'Descobertas', icon: Zap },
                                { key: 'milestones', label: 'Marcos', icon: Award }
                            ].map((tab) => (
                                <Button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    variant={filter === tab.key ? "default" : "outline"}
                                    size="sm"
                                    className="gap-2 whitespace-nowrap"
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </Button>
                            ))}
                        </div>

                        {/* Posts */}
                        <div className="space-y-6">
                            {feedPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Direita */}
                    <div className="space-y-6">
                        {/* Trending Now */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Flame className="h-5 w-5 text-orange-500" />
                                    Trending Now
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {trendingTracks.map((track, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{track.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-orange-600">{track.trend}</p>
                                            <p className="text-xs text-gray-500">{track.claims}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Who to Follow */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Hipsters para Seguir
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { name: 'beatmaster_pro', avatar: '🎛️', followers: '12.3K', badge: 'Producer' },
                                    { name: 'melody_hunter', avatar: '🎼', followers: '8.7K', badge: 'Curator' },
                                    { name: 'bass_detective', avatar: '🔍', followers: '15.1K', badge: 'Detective' }
                                ].map((user, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{user.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{user.name}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">{user.badge}</Badge>
                                                <span className="text-xs text-gray-500">{user.followers}</span>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            Seguir
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Latest Claims Component */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5 text-purple-500" />
                                    Atividade Recente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GetLatestClaims />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
