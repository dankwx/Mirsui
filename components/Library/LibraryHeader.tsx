'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Music, Clock, TrendingUp, Award, Users, Star } from 'lucide-react'

interface LibraryHeaderProps {
    userData: {
        display_name?: string
        username?: string
        avatar_url?: string
        achievements?: any[]
        rating?: any[]
        followers?: any[]
        following?: any[]
    }
    stats: {
        totalTracks: number
        totalPlaylists: number
        hoursListened: number
        discoveryScore: number
        totalDiscoveries: number
    }
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ userData, stats }) => {
    const displayName = userData?.display_name || userData?.username || 'Music Lover'
    
    return (
        <div className="mb-8">
            {/* Header principal */}
            <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                    {userData?.avatar_url ? (
                        <img
                            src={userData.avatar_url}
                            alt={displayName}
                            className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-primary/20">
                            {displayName.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-green-500 h-6 w-6 rounded-full border-2 border-background flex items-center justify-center">
                        <Music className="h-3 w-3 text-white" />
                    </div>
                </div>
                
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {displayName}&apos;s Library
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Your personal music discovery vault
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            <Star className="h-3 w-3 mr-1" />
                            Discovery Score: {stats.discoveryScore}/10
                        </Badge>
                        <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {stats.hoursListened}h listened
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                        <Music className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-900">{stats.totalTracks}</div>
                        <div className="text-sm text-blue-700">Saved Tracks</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-900">{stats.totalPlaylists}</div>
                        <div className="text-sm text-purple-700">Playlists</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4 text-center">
                        <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-900">{stats.totalDiscoveries}</div>
                        <div className="text-sm text-orange-700">Discoveries</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                    <CardContent className="p-4 text-center">
                        <Clock className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-pink-900">{stats.hoursListened}</div>
                        <div className="text-sm text-pink-700">Hours</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                    <CardContent className="p-4 text-center">
                        <Star className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-cyan-900">{stats.discoveryScore}</div>
                        <div className="text-sm text-cyan-700">Score</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default LibraryHeader