'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
    const totalConnections = (userData?.followers?.length ?? 0) + (userData?.following?.length ?? 0)
    
    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_30px_80px_rgba(8,4,20,0.45)] backdrop-blur-lg sm:px-8 sm:py-10">
                <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,92,255,0.25),_transparent_65%)] blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-60 w-60 translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,113,181,0.22),_transparent_65%)] blur-3xl" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                    <div className="relative w-fit">
                        {userData?.avatar_url ? (
                            <img
                                src={userData.avatar_url}
                                alt={displayName}
                                className="h-28 w-28 rounded-[24px] object-cover border border-white/10 bg-white/[0.08] p-1 shadow-[0_25px_60px_rgba(8,4,20,0.5)]"
                            />
                        ) : (
                            <div className="flex h-28 w-28 items-center justify-center rounded-[24px] bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 text-3xl font-semibold uppercase text-white shadow-[0_25px_60px_rgba(8,4,20,0.5)]">
                                {displayName.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                            <Music className="h-3.5 w-3.5 text-purple-300" />
                            biblioteca
                        </div>
                    </div>

                    <div className="relative z-10 flex-1 space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-[2.5rem]">
                                {displayName}&apos;s Library
                            </h1>
                            <p className="max-w-xl text-sm leading-relaxed text-white/65 md:text-base">
                                Sua cápsula de descobertas. Acompanhe playlists, horas dedicadas e o impacto das suas apostas musicais.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1 text-white/70">
                                <Star className="h-3.5 w-3.5 text-amber-300" />
                                discovery score {stats.discoveryScore}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1 text-white/70">
                                <Clock className="h-3.5 w-3.5 text-sky-300" />
                                {stats.hoursListened}h dedicadas
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1 text-white/70">
                                <Users className="h-3.5 w-3.5 text-emerald-300" />
                                {totalConnections} conexões
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05] shadow-[0_20px_50px_rgba(8,4,20,0.35)] transition hover:border-white/20 hover:bg-white/[0.07]">
                    <CardContent className="space-y-3 p-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                            <Music className="h-4 w-4 text-purple-300" />
                            tracks
                        </div>
                        <div className="text-3xl font-semibold tracking-tight text-white">{stats.totalTracks}</div>
                        <p className="text-sm text-white/55">Faixas salvas</p>
                    </CardContent>
                </Card>

                <Card className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05] shadow-[0_20px_50px_rgba(8,4,20,0.35)] transition hover:border-white/20 hover:bg-white/[0.07]">
                    <CardContent className="space-y-3 p-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                            <TrendingUp className="h-4 w-4 text-pink-300" />
                            playlists
                        </div>
                        <div className="text-3xl font-semibold tracking-tight text-white">{stats.totalPlaylists}</div>
                        <p className="text-sm text-white/55">Coleções criadas</p>
                    </CardContent>
                </Card>

                <Card className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05] shadow-[0_20px_50px_rgba(8,4,20,0.35)] transition hover:border-white/20 hover:bg-white/[0.07]">
                    <CardContent className="space-y-3 p-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                            <Award className="h-4 w-4 text-amber-300" />
                            discoveries
                        </div>
                        <div className="text-3xl font-semibold tracking-tight text-white">{stats.totalDiscoveries}</div>
                        <p className="text-sm text-white/55">Novas apostas</p>
                    </CardContent>
                </Card>

                <Card className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05] shadow-[0_20px_50px_rgba(8,4,20,0.35)] transition hover:border-white/20 hover:bg-white/[0.07]">
                    <CardContent className="space-y-3 p-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                            <Clock className="h-4 w-4 text-sky-300" />
                            horas
                        </div>
                        <div className="text-3xl font-semibold tracking-tight text-white">{stats.hoursListened}</div>
                        <p className="text-sm text-white/55">Tempo dedicado</p>
                    </CardContent>
                </Card>

                <Card className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05] shadow-[0_20px_50px_rgba(8,4,20,0.35)] transition hover:border-white/20 hover:bg-white/[0.07]">
                    <CardContent className="space-y-3 p-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                            <Users className="h-4 w-4 text-emerald-300" />
                            comunidade
                        </div>
                        <div className="text-3xl font-semibold tracking-tight text-white">{totalConnections}</div>
                        <p className="text-sm text-white/55">Conexões totais</p>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

export default LibraryHeader