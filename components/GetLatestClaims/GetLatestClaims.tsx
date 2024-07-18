'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
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

export default function GetLatestClaims() {
    const supabase = createClient()
    const [claims, setClaims] = useState<Claim[]>([])
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

    useEffect(() => {
        if (claims.length > prevClaimsRef.current.length) {
            setAnimatingOut(true)
            setTimeout(() => {
                setAnimatingOut(false)
                prevClaimsRef.current = claims
            }, 500) // Duração da animação
        } else {
            prevClaimsRef.current = claims
        }
    }, [claims])

    async function fetchClaims() {
        const { data, error } = await supabase
            .from('combined_claims')
            .select('*')
            .order('claim_date', { ascending: false })
            .limit(4)

        if (error) {
            console.error('Error fetching claims:', error)
        } else {
            setClaims(data as Claim[])
        }
    }

    const ChannelIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-youtube"
        >
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
            <path d="m10 15 5-3-5-3z" />
        </svg>
    )

    const ArtistIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-music"
        >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
        </svg>
    )

    return (
        <div className="p-4 font-sans w-fit">
            <h1 className="font-sans text-2xl font-bold">
                O que as pessoas estão salvando
            </h1>
            {claims.map((claim, index) => {
                const isNew = !prevClaimsRef.current.some(
                    (prevClaim) => prevClaim.id === claim.id
                )
                return (
                    <div
                        key={`${claim.claim_type}-${claim.id}`}
                        className={`mb-5 overflow-hidden border-b border-gray-300 pb-2.5 ${isNew ? 'animate-slide-down' : ''} ${animatingOut && index === 3 ? 'animate-fade-out' : ''} `}
                    >
                        <div className="flex items-center">
                            {claim.claim_type === 'channel' ? (
                                <ChannelIcon />
                            ) : (
                                <ArtistIcon />
                            )}
                            <p className="ml-2">
                                <Link
                                    className="font-bold"
                                    href={`/user/${claim.username}/`}
                                >
                                    {claim.username}
                                </Link>{' '}
                                resgatou o{' '}
                                {claim.claim_type === 'channel'
                                    ? 'canal'
                                    : 'artista'}{' '}
                                {claim.entity_name}
                            </p>{' '}
                            <img
                                src={claim.profile_image_url}
                                alt={`${claim.entity_name} logo`}
                                className="ml-2 h-10 w-10 rounded-full"
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
