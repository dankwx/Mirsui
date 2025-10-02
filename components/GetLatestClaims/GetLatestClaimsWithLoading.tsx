'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { GetLatestClaimsSkeleton } from './GetLatestClaimsSkeleton'
import Link from 'next/link'

interface Claim {
    id: number
    claim_type: 'channel' | 'artist'
    user_id: string
    username: string
    count_at_claim: number
    claim_date: string
    entity_name: string
    profile_image_url: string
    current_count: number
}

export default function GetLatestClaimsWithLoading() {
    const supabase = createClient()
    const [claims, setClaims] = useState<Claim[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const prevClaimsRef = useRef<Claim[]>([])
    const [animatingOut, setAnimatingOut] = useState(false)

    useEffect(() => {
        fetchClaims()

        const channel = supabase
            .channel('claims_and_users_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'userchannelclaims' },
                () => {
                    fetchClaims()
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'userartistclaims' },
                () => {
                    fetchClaims()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchClaims = async () => {
        try {
            // Buscar channel claims
            const { data: channelClaims, error: channelError } = await supabase
                .from('userchannelclaims')
                .select(`
                    id,
                    user_id,
                    count_at_claim,
                    claim_date,
                    channels (channel_name, profile_image_url, subscriber_count),
                    profiles (username)
                `)
                .order('claim_date', { ascending: false })
                .limit(10)

            // Buscar artist claims  
            const { data: artistClaims, error: artistError } = await supabase
                .from('userartistclaims')
                .select(`
                    id,
                    user_id,
                    count_at_claim,
                    claim_date,
                    artists (artist_name, profile_image_url, follower_count),
                    profiles (username)
                `)
                .order('claim_date', { ascending: false })
                .limit(10)

            if (channelError || artistError) {
                console.error('Erro ao buscar claims:', channelError || artistError)
                setIsLoading(false)
                return
            }

            // Formatar e combinar os dados
            const formattedClaims: Claim[] = [
                ...(channelClaims || []).map(claim => ({
                    id: claim.id,
                    claim_type: 'channel' as const,
                    user_id: claim.user_id,
                    username: (claim.profiles as any)?.username || 'Unknown',
                    count_at_claim: claim.count_at_claim,
                    claim_date: claim.claim_date,
                    entity_name: (claim.channels as any)?.channel_name || 'Unknown Channel',
                    profile_image_url: (claim.channels as any)?.profile_image_url || '',
                    current_count: (claim.channels as any)?.subscriber_count || 0
                })),
                ...(artistClaims || []).map(claim => ({
                    id: claim.id,
                    claim_type: 'artist' as const,
                    user_id: claim.user_id,
                    username: (claim.profiles as any)?.username || 'Unknown',
                    count_at_claim: claim.count_at_claim,
                    claim_date: claim.claim_date,
                    entity_name: (claim.artists as any)?.artist_name || 'Unknown Artist',
                    profile_image_url: (claim.artists as any)?.profile_image_url || '',
                    current_count: (claim.artists as any)?.follower_count || 0
                }))
            ]

            // Ordenar por data mais recente
            formattedClaims.sort((a, b) => new Date(b.claim_date).getTime() - new Date(a.claim_date).getTime())

            // Pegar apenas os 10 mais recentes
            const latestClaims = formattedClaims.slice(0, 10)

            // Verificar se houve mudanças
            const hasChanges = JSON.stringify(prevClaimsRef.current) !== JSON.stringify(latestClaims)
            
            if (hasChanges && prevClaimsRef.current.length > 0) {
                setAnimatingOut(true)
                setTimeout(() => {
                    setClaims(latestClaims)
                    prevClaimsRef.current = latestClaims
                    setAnimatingOut(false)
                }, 300)
            } else {
                setClaims(latestClaims)
                prevClaimsRef.current = latestClaims
            }

            setIsLoading(false)
        } catch (error) {
            console.error('Erro ao buscar claims:', error)
            setIsLoading(false)
        }
    }

    const formatTimeAgo = (date: string) => {
        const now = new Date()
        const claimDate = new Date(date)
        const diffInSeconds = Math.floor((now.getTime() - claimDate.getTime()) / 1000)

        const minutes = Math.floor(diffInSeconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (diffInSeconds < 60) return 'agora'
        if (minutes < 60) return `${minutes}min`
        if (hours < 24) return `${hours}h`
        if (days < 7) return `${days}d`
        return claimDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }

    const getGrowthPercentage = (initial: number, current: number): number => {
        if (initial === 0) return 0
        return ((current - initial) / initial) * 100
    }

    const formatCount = (count: number): string => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
        return count.toString()
    }

    if (isLoading) {
        return <GetLatestClaimsSkeleton />
    }

    return (
        <div className="bg-white rounded-lg shadow-md border-0">
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Atividade Recente
                </h3>
                
                <div className={`space-y-4 transition-opacity duration-300 ${animatingOut ? 'opacity-50' : 'opacity-100'}`}>
                    {claims.length > 0 ? (
                        claims.map((claim) => {
                            const growth = getGrowthPercentage(claim.count_at_claim, claim.current_count)
                            const isPositiveGrowth = growth > 0
                            
                            return (
                                <div 
                                    key={`${claim.claim_type}-${claim.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="relative">
                                        {claim.profile_image_url ? (
                                            <img
                                                src={claim.profile_image_url}
                                                alt={claim.entity_name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                <span className="text-white text-sm font-semibold">
                                                    {claim.entity_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">
                                                {claim.claim_type === 'channel' ? '📺' : '🎵'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Link 
                                                href={`/user/${claim.username}`}
                                                className="font-semibold text-gray-800 hover:text-purple-600 transition-colors text-sm"
                                            >
                                                @{claim.username}
                                            </Link>
                                            <span className="text-gray-400 text-xs">•</span>
                                            <span className="text-gray-500 text-xs">
                                                {formatTimeAgo(claim.claim_date)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm truncate">
                                            reivindicou {claim.entity_name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">
                                                {formatCount(claim.count_at_claim)} → {formatCount(claim.current_count)}
                                            </span>
                                            {isPositiveGrowth && (
                                                <span className="text-xs text-green-600 font-medium">
                                                    +{growth.toFixed(1)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">Nenhuma atividade recente</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}