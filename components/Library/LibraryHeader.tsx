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
    isOwnLibrary?: boolean
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ userData, stats, isOwnLibrary = true }) => {
    const displayName = userData?.display_name || userData?.username || 'Music Lover'
    
    return (
        <div className="mb-8">
            {/* Header principal */}
            <div className="flex items-center gap-6 mb-6 bg-white/60 backdrop-blur-2xl rounded-3xl p-8 border border-white/60 shadow-2xl">
                <div className="relative">
                    {userData?.avatar_url ? (
                        <img
                            src={userData.avatar_url}
                            alt={displayName}
                            className="h-24 w-24 rounded-full object-cover border-4 border-white/80 ring-4 ring-purple-500/20 shadow-xl"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white/80 ring-4 ring-purple-500/20 shadow-xl">
                            {displayName.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-green-400 to-emerald-500 h-7 w-7 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                        <Music className="h-4 w-4 text-white" />
                    </div>
                </div>
                
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {displayName}&apos;s Library
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Your personal music discovery vault
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200/50 shadow-md">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Discovery Score: {stats.discoveryScore}/10
                        </Badge>
                        <Badge variant="outline" className="bg-white/60 backdrop-blur-md border-white/60 shadow-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {stats.hoursListened}h listened
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 via-white/60 to-blue-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md w-fit mx-auto p-3 rounded-2xl mb-2 shadow-lg">
                            <Music className="h-8 w-8 text-blue-700" />
                        </div>
                        <div className="text-2xl font-bold text-blue-900">{stats.totalTracks}</div>
                        <div className="text-sm text-blue-700 font-medium">Saved Tracks</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 via-white/60 to-purple-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md w-fit mx-auto p-3 rounded-2xl mb-2 shadow-lg">
                            <TrendingUp className="h-8 w-8 text-purple-700" />
                        </div>
                        <div className="text-2xl font-bold text-purple-900">{stats.totalPlaylists}</div>
                        <div className="text-sm text-purple-700 font-medium">Playlists</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 via-white/60 to-orange-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md w-fit mx-auto p-3 rounded-2xl mb-2 shadow-lg">
                            <Award className="h-8 w-8 text-orange-700" />
                        </div>
                        <div className="text-2xl font-bold text-orange-900">{stats.totalDiscoveries}</div>
                        <div className="text-sm text-orange-700 font-medium">Discoveries</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-500/10 via-white/60 to-pink-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                        <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-md w-fit mx-auto p-3 rounded-2xl mb-2 shadow-lg">
                            <Clock className="h-8 w-8 text-pink-700" />
                        </div>
                        <div className="text-2xl font-bold text-pink-900">{stats.hoursListened}</div>
                        <div className="text-sm text-pink-700 font-medium">Hours</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500/10 via-white/60 to-cyan-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-md w-fit mx-auto p-3 rounded-2xl mb-2 shadow-lg">
                            <Star className="h-8 w-8 text-cyan-700" />
                        </div>
                        <div className="text-2xl font-bold text-cyan-900">{stats.discoveryScore}</div>
                        <div className="text-sm text-cyan-700 font-medium">Score</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default LibraryHeader