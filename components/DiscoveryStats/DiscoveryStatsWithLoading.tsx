'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

// Componente Skeleton para DiscoveryStats
export function DiscoveryStatsSkeleton() {
    return (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-32" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* User Profile Skeleton */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-8" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Card key={index} className="bg-white/60 border-purple-100">
                            <CardContent className="p-3 text-center">
                                <Skeleton className="h-6 w-8 mx-auto mb-1" />
                                <Skeleton className="h-3 w-16 mx-auto" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Progress Bars Skeleton */}
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between mb-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                    </div>
                </div>

                {/* Badges Skeleton */}
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-6 w-16 rounded-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Interface do componente original (mantida para referência)
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

// Componente com loading state
export default function DiscoveryStatsWithLoading() {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<DiscoveryStats | null>(null)

    useEffect(() => {
        // Simular carregamento de dados
        const loadStats = async () => {
            try {
                // Aqui você colocaria a lógica real de busca de dados
                await new Promise(resolve => setTimeout(resolve, 800)) // Simular delay
                
                // Dados mock para demonstração
                const mockStats: DiscoveryStats = {
                    userId: '1',
                    username: 'johndoe',
                    avatar: '/placeholder-avatar.jpg',
                    totalClaims: 42,
                    discoverRating: 8.7,
                    ranking: 15,
                    streakDays: 7,
                    earlyHits: 12,
                    viralPredictions: 3,
                    monthlyGrowth: 25,
                    badges: ['early-bird', 'trendsetter', 'music-guru'],
                    recentAchievements: [],
                    topGenres: [
                        { name: 'Indie Pop', percentage: 45, claims: 19 },
                        { name: 'Electronic', percentage: 30, claims: 13 },
                        { name: 'Alternative', percentage: 25, claims: 10 }
                    ]
                }
                
                setStats(mockStats)
            } catch (error) {
                console.error('Erro ao carregar stats:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadStats()
    }, [])

    if (isLoading) {
        return <DiscoveryStatsSkeleton />
    }

    if (!stats) {
        return (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg">
                <CardContent className="p-6 text-center">
                    <Music className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-purple-600">Erro ao carregar estatísticas</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Target className="h-5 w-5" />
                    Suas Descobertas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* User Profile */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                            <span className="text-lg font-semibold text-purple-700">
                                {stats.username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        {stats.ranking <= 10 && (
                            <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-purple-800">@{stats.username}</p>
                        <p className="text-sm text-purple-600">#{stats.ranking} no ranking</p>
                    </div>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                        {stats.discoverRating}/10
                    </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-white/60 border-purple-100">
                            <CardContent className="p-3 text-center">
                                <div className="text-2xl font-bold text-purple-700">{stats.totalClaims}</div>
                                <div className="text-xs text-purple-600">Claims</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-white/60 border-purple-100">
                            <CardContent className="p-3 text-center">
                                <div className="text-2xl font-bold text-purple-700">{stats.earlyHits}</div>
                                <div className="text-xs text-purple-600">Early Hits</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="bg-white/60 border-purple-100">
                            <CardContent className="p-3 text-center">
                                <div className="text-2xl font-bold text-purple-700">{stats.streakDays}</div>
                                <div className="text-xs text-purple-600">Sequência</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="bg-white/60 border-purple-100">
                            <CardContent className="p-3 text-center">
                                <div className="text-2xl font-bold text-purple-700">{stats.viralPredictions}</div>
                                <div className="text-xs text-purple-600">Virais</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-purple-700">Discovery Rating</span>
                            <span className="text-sm font-semibold text-purple-800">{stats.discoverRating}/10</span>
                        </div>
                        <Progress value={stats.discoverRating * 10} className="h-2" />
                    </div>
                    
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-purple-700">Crescimento Mensal</span>
                            <span className="text-sm font-semibold text-green-600">+{stats.monthlyGrowth}%</span>
                        </div>
                        <Progress value={Math.min(stats.monthlyGrowth, 100)} className="h-2" />
                    </div>
                </div>

                {/* Top Genres */}
                <div>
                    <h4 className="text-sm font-semibold text-purple-700 mb-2">Gêneros Favoritos</h4>
                    <div className="space-y-2">
                        {stats.topGenres.map((genre) => (
                            <div key={genre.name} className="flex justify-between items-center">
                                <span className="text-sm text-purple-600">{genre.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 bg-purple-100 rounded-full h-1.5">
                                        <div 
                                            className="bg-purple-500 h-1.5 rounded-full" 
                                            style={{ width: `${genre.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-purple-500 w-8">{genre.claims}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                    {stats.badges.map((badge) => (
                        <Badge key={badge} variant="outline" className="text-xs border-purple-300 text-purple-700">
                            {badge.replace('-', ' ')}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}