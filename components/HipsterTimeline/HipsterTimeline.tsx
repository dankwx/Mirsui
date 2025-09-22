'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
    TrendingUp, 
    Crown, 
    Users, 
    Music, 
    Play, 
    Share2, 
    Trophy,
    Flame,
    Zap,
    Clock,
    Calendar,
    Target,
    Sparkles,
    Award
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'

interface HipsterTimelineProps {
    trackId: string
    trackTitle: string
    artistName: string
}

// Static mock data - consistent between server and client
const mockTimelineData = [
    { date: '2024-01-01', claims: 0, spotifyPopularity: 8, event: null, eventUser: null, daysSinceStart: 0 },
    { date: '2024-01-15', claims: 1, spotifyPopularity: 12, event: 'first_claim', eventUser: 'musiclover_23', daysSinceStart: 14 },
    { date: '2024-01-16', claims: 1, spotifyPopularity: 13, event: null, eventUser: null, daysSinceStart: 15 },
    { date: '2024-01-20', claims: 2, spotifyPopularity: 15, event: null, eventUser: null, daysSinceStart: 19 },
    { date: '2024-01-25', claims: 3, spotifyPopularity: 16, event: null, eventUser: null, daysSinceStart: 24 },
    { date: '2024-02-01', claims: 5, spotifyPopularity: 17, event: null, eventUser: null, daysSinceStart: 31 },
    { date: '2024-02-03', claims: 8, spotifyPopularity: 18, event: 'early_adopters', eventUser: 'vinylhunter', daysSinceStart: 33 },
    { date: '2024-02-10', claims: 12, spotifyPopularity: 20, event: null, eventUser: null, daysSinceStart: 40 },
    { date: '2024-02-15', claims: 18, spotifyPopularity: 22, event: null, eventUser: null, daysSinceStart: 45 },
    { date: '2024-02-20', claims: 25, spotifyPopularity: 24, event: null, eventUser: null, daysSinceStart: 50 },
    { date: '2024-02-28', claims: 35, spotifyPopularity: 25, event: 'momentum', eventUser: 'indiekid', daysSinceStart: 58 },
    { date: '2024-03-05', claims: 45, spotifyPopularity: 28, event: null, eventUser: null, daysSinceStart: 64 },
    { date: '2024-03-10', claims: 58, spotifyPopularity: 32, event: null, eventUser: null, daysSinceStart: 69 },
    { date: '2024-03-15', claims: 75, spotifyPopularity: 45, event: 'boom_detected', eventUser: 'trendsetter', daysSinceStart: 74 },
    { date: '2024-03-20', claims: 95, spotifyPopularity: 52, event: null, eventUser: null, daysSinceStart: 79 },
    { date: '2024-03-25', claims: 120, spotifyPopularity: 58, event: null, eventUser: null, daysSinceStart: 84 },
    { date: '2024-04-01', claims: 180, spotifyPopularity: 78, event: 'viral_tiktok', eventUser: 'tiktoker_pro', daysSinceStart: 91 },
    { date: '2024-04-05', claims: 240, spotifyPopularity: 82, event: null, eventUser: null, daysSinceStart: 95 },
    { date: '2024-04-10', claims: 320, spotifyPopularity: 85, event: null, eventUser: null, daysSinceStart: 100 },
    { date: '2024-04-15', claims: 420, spotifyPopularity: 87, event: null, eventUser: null, daysSinceStart: 105 },
    { date: '2024-04-20', claims: 580, spotifyPopularity: 89, event: 'mainstream', eventUser: 'casual_listener', daysSinceStart: 110 },
]

const earlyAdopters = [
    { username: 'musiclover_23', avatar: '🎵', position: 1, date: '2024-01-15', status: 'Primeiro Claim!' },
    { username: 'vinylhunter', avatar: '🎧', position: 2, date: '2024-01-18', status: 'Hipster Alert' },
    { username: 'indiekid', avatar: '🎸', position: 3, date: '2024-01-22', status: 'Early Bird' },
    { username: 'trendsetter', avatar: '✨', position: 4, date: '2024-01-25', status: 'Taste Maker' },
    { username: 'soundhunter', avatar: '🔍', position: 5, date: '2024-01-28', status: 'Discoverer' },
    { username: 'beatfinder', avatar: '🎯', position: 6, date: '2024-02-01', status: 'Pioneer' },
    { username: 'melodic_mind', avatar: '🧠', position: 7, date: '2024-02-03', status: 'Visionary' },
    { username: 'rhythm_rebel', avatar: '⚡', position: 8, date: '2024-02-05', status: 'Risk Taker' },
]

const getEventIcon = (eventType: string) => {
    switch (eventType) {
        case 'first_claim': return <Crown className="h-4 w-4 text-yellow-500" />
        case 'early_adopters': return <Target className="h-4 w-4 text-purple-500" />
        case 'momentum': return <TrendingUp className="h-4 w-4 text-blue-500" />
        case 'boom_detected': return <Zap className="h-4 w-4 text-orange-500" />
        case 'viral_tiktok': return <Flame className="h-4 w-4 text-red-500" />
        case 'mainstream': return <Users className="h-4 w-4 text-green-500" />
        default: return null
    }
}

const getEventTitle = (eventType: string) => {
    switch (eventType) {
        case 'first_claim': return 'Primeiro Claim!'
        case 'early_adopters': return 'Hipsters Chegando'
        case 'momentum': return 'Ganhando Tração'
        case 'boom_detected': return 'Boom Detectado!'
        case 'viral_tiktok': return 'Viral no TikTok'
        case 'mainstream': return 'Mainstream'
        default: return eventType
    }
}

const getEventColor = (eventType: string) => {
    switch (eventType) {
        case 'first_claim': return 'from-yellow-500 to-orange-500'
        case 'early_adopters': return 'from-purple-500 to-indigo-500'
        case 'momentum': return 'from-blue-500 to-cyan-500'
        case 'boom_detected': return 'from-orange-500 to-red-500'
        case 'viral_tiktok': return 'from-red-500 to-pink-500'
        case 'mainstream': return 'from-green-500 to-emerald-500'
        default: return 'from-gray-400 to-gray-600'
    }
}

export default function HipsterTimeline({ trackId, trackTitle, artistName }: HipsterTimelineProps) {
    const timelineData = mockTimelineData
    const events = timelineData.filter((d: any) => d.event)
    
    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header Section */}
            <motion.div 
                className="text-center space-y-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles className="h-6 w-6 text-purple-500" />
                    </motion.div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Hipster Timeline
                    </h2>
                    <motion.div
                        animate={{ rotate: [0, -360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles className="h-6 w-6 text-purple-500" />
                    </motion.div>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Acompanhe a jornada épica de <span className="font-semibold text-purple-600">{trackTitle}</span> desde os primeiros claims até virar mainstream. 
                    Quem foram os verdadeiros hipsters que descobriram essa gem antes de todo mundo?
                </p>
            </motion.div>

            {/* Timeline Chart */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-50 to-white hover:shadow-3xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Evolução dos Claims vs Popularidade Spotify
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timelineData}>
                                    <defs>
                                        <linearGradient id="claimsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                        </linearGradient>
                                        <linearGradient id="spotifyGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1db954" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#1db954" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(date: any) => new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                                        className="text-xs"
                                    />
                                    <YAxis className="text-xs" />
                                    <Tooltip 
                                        labelFormatter={(date: any) => new Date(date).toLocaleDateString('pt-BR')}
                                        formatter={(value: any, name: any) => [
                                            value, 
                                            name === 'claims' ? 'Claims' : 'Spotify Popularidade'
                                        ]}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="claims"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fill="url(#claimsGradient)"
                                        name="Claims"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="spotifyPopularity"
                                        stroke="#1db954"
                                        strokeWidth={3}
                                        fill="url(#spotifyGradient)"
                                        name="Spotify"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Events Timeline */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        Marcos Históricos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {events.map((event: any, index: number) => (
                            <div key={event.date} className="flex items-start gap-4">
                                <div className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${getEventColor(event.event!)} shadow-lg`}>
                                    {getEventIcon(event.event!)}
                                    {index < events.length - 1 && (
                                        <div className="absolute top-12 left-1/2 h-8 w-0.5 -translate-x-1/2 bg-gradient-to-b from-gray-300 to-transparent" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{getEventTitle(event.event!)}</h3>
                                        <Badge variant="outline" className="text-xs">
                                            {new Date(event.date).toLocaleDateString('pt-BR')}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Claimed por <span className="font-medium text-purple-600">@{event.eventUser}</span>
                                        {' • '}
                                        <span className="font-medium">{event.claims} claims totais</span>
                                        {' • '}
                                        <span className="font-medium">{event.spotifyPopularity}% popularidade Spotify</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                </Card>
            </motion.div>

            {/* Early Adopters Hall of Fame */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5" />
                        Hall da Fama: Primeiros Hipsters
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {earlyAdopters.map((user, index) => (
                            <div key={user.username} className={`relative rounded-xl p-4 ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg scale-105' :
                                index < 3 ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200' :
                                'bg-white border border-gray-200'
                            }`}>
                                {index === 0 && (
                                    <div className="absolute -top-2 -right-2">
                                        <div className="bg-yellow-500 text-white rounded-full p-2">
                                            <Crown className="h-4 w-4" />
                                        </div>
                                    </div>
                                )}
                                <div className="text-center space-y-2">
                                    <div className="text-2xl">{user.avatar}</div>
                                    <div className="font-semibold text-sm">{user.username}</div>
                                    <Badge variant={index === 0 ? "secondary" : "outline"} className="text-xs">
                                        #{user.position} • {user.status}
                                    </Badge>
                                    <div className="text-xs opacity-75">
                                        {new Date(user.date).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                </Card>
            </motion.div>

            {/* Share Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <Trophy className="h-6 w-6" />
                            <h3 className="text-xl font-bold">Timeline Épico!</h3>
                        </div>
                        <p className="opacity-90">
                            Essa música teve uma jornada incrível! Compartilhe esse timeline com seus amigos.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="secondary" size="sm" className="gap-2">
                                <Share2 className="h-4 w-4" />
                                Compartilhar Timeline
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                                <Music className="h-4 w-4" />
                                Ouvir no Spotify
                            </Button>
                        </div>
                    </div>
                </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
