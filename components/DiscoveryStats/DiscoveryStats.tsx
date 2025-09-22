'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
    TrendingUp, 
    TrendingDown, 
    Target, 
    Crown, 
    Flame, 
    Zap,
    Award,
    Music,
    Users,
    Calendar,
    Clock,
    Star,
    Trophy,
    Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DiscoveryStats {
    userId: string
    username: string
    avatar: string
    totalClaims: number
    discoverRating: number
    ranking: number
    streakDays: number
    earlyHits: number
    viralPredictions: number
    monthlyGrowth: number
    badges: string[]
    recentAchievements: Array<{
        title: string
        description: string
        date: string
        type: 'claim' | 'streak' | 'prediction' | 'milestone'
        icon: string
    }>
    topGenres: Array<{
        name: string
        percentage: number
        claims: number
    }>
}

// Mock data
const mockStats: DiscoveryStats = {
    userId: '1',
    username: 'musiclover_23',
    avatar: '🎵',
    totalClaims: 1247,
    discoverRating: 92.4,
    ranking: 23,
    streakDays: 45,
    earlyHits: 89,
    viralPredictions: 34,
    monthlyGrowth: 15.7,
    badges: ['Early Bird', 'Trend Spotter', 'Genre Explorer', 'Viral Prophet'],
    recentAchievements: [
        {
            title: 'Viral Prophecy',
            description: 'Previu que "Flowers" seria hit #1',
            date: '2 dias atrás',
            type: 'prediction',
            icon: '🔮'
        },
        {
            title: 'Claim Streak',
            description: '45 dias consecutivos claimando',
            date: '1 semana atrás',
            type: 'streak',
            icon: '🔥'
        },
        {
            title: 'First Blood',
            description: 'Primeiro claim em "Anti-Hero"',
            date: '2 semanas atrás',
            type: 'claim',
            icon: '🩸'
        }
    ],
    topGenres: [
        { name: 'Pop', percentage: 35, claims: 436 },
        { name: 'Hip-Hop', percentage: 28, claims: 349 },
        { name: 'Indie', percentage: 20, claims: 249 },
        { name: 'R&B', percentage: 17, claims: 212 }
    ]
}

const getAchievementIcon = (type: string) => {
    switch (type) {
        case 'claim': return <Target className="h-4 w-4" />
        case 'streak': return <Flame className="h-4 w-4" />
        case 'prediction': return <Zap className="h-4 w-4" />
        case 'milestone': return <Award className="h-4 w-4" />
        default: return <Star className="h-4 w-4" />
    }
}

const getAchievementColor = (type: string) => {
    switch (type) {
        case 'claim': return 'from-purple-500 to-purple-600'
        case 'streak': return 'from-orange-500 to-red-500'
        case 'prediction': return 'from-blue-500 to-indigo-600'
        case 'milestone': return 'from-yellow-500 to-orange-500'
        default: return 'from-gray-500 to-gray-600'
    }
}

const getRankingBadge = (ranking: number) => {
    if (ranking <= 10) return { color: 'from-yellow-400 to-yellow-600', text: 'LENDA', icon: Crown }
    if (ranking <= 50) return { color: 'from-purple-400 to-purple-600', text: 'MESTRE', icon: Award }
    if (ranking <= 100) return { color: 'from-blue-400 to-blue-600', text: 'EXPERT', icon: Target }
    return { color: 'from-green-400 to-green-600', text: 'RISING', icon: TrendingUp }
}

export default function DiscoveryStatsCard() {
    const stats = mockStats
    const rankingBadge = getRankingBadge(stats.ranking)
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white">
                <CardHeader className={`bg-gradient-to-r ${rankingBadge.color} text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
                    
                    <CardTitle className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">{stats.avatar}</div>
                            <div>
                                <h3 className="text-xl font-bold">{stats.username}</h3>
                                <div className="flex items-center gap-2">
                                    <rankingBadge.icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{rankingBadge.text}</span>
                                    <span className="text-xs opacity-80">#{stats.ranking}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{stats.discoverRating}%</div>
                            <div className="text-xs opacity-80">Discover Rating</div>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100"
                        >
                            <div className="text-2xl font-bold text-purple-600">{stats.totalClaims}</div>
                            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                                <Target className="h-3 w-3" />
                                Total Claims
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100"
                        >
                            <div className="text-2xl font-bold text-orange-600">{stats.streakDays}</div>
                            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                                <Flame className="h-3 w-3" />
                                Streak Dias
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="text-center p-3 bg-green-50 rounded-lg border border-green-100"
                        >
                            <div className="text-2xl font-bold text-green-600">{stats.earlyHits}</div>
                            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                                <Zap className="h-3 w-3" />
                                Early Hits
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100"
                        >
                            <div className="text-2xl font-bold text-blue-600">{stats.viralPredictions}</div>
                            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                                <Trophy className="h-3 w-3" />
                                Viral Hits
                            </div>
                        </motion.div>
                    </div>

                    {/* Crescimento Mensal */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Crescimento este mês</span>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-green-600 font-bold">+{stats.monthlyGrowth}%</span>
                            </div>
                        </div>
                        <Progress value={stats.monthlyGrowth} className="h-2" />
                    </div>

                    {/* Top Gêneros */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            Gêneros Favoritos
                        </h4>
                        <div className="space-y-2">
                            {stats.topGenres.map((genre, index) => (
                                <div key={genre.name} className="flex items-center gap-3">
                                    <div className="w-12 text-xs text-gray-500 font-medium">#{index + 1}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium">{genre.name}</span>
                                            <span className="text-xs text-gray-500">{genre.claims} claims</span>
                                        </div>
                                        <Progress value={genre.percentage} className="h-1.5" />
                                    </div>
                                    <div className="text-sm font-bold text-purple-600">{genre.percentage}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Conquistas Recentes */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Conquistas Recentes
                        </h4>
                        <div className="space-y-3">
                            {stats.recentAchievements.map((achievement, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getAchievementColor(achievement.type)} flex items-center justify-center text-white shadow-lg`}>
                                        <span className="text-lg">{achievement.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-semibold text-sm">{achievement.title}</h5>
                                            {getAchievementIcon(achievement.type)}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">{achievement.description}</p>
                                        <span className="text-xs text-gray-500">{achievement.date}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Badges Conquistados
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {stats.badges.map((badge, index) => (
                                <motion.div
                                    key={badge}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Badge 
                                        variant="secondary" 
                                        className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 hover:shadow-md transition-shadow"
                                    >
                                        {badge}
                                    </Badge>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="pt-4 border-t">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2">
                            <Target className="h-4 w-4 mr-2" />
                            Claim Nova Música
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
