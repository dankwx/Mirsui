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
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'userchannelclaims' }, 
                () => {
                    fetchClaims()
                }
            )
            .on('postgres_changes', 
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

    return (
        <div className="p-4 font-sans">
            <h1 className="font-sans text-2xl font-bold">O que as pessoas estão salvando</h1>
            {claims.map((claim, index) => {
                const isNew = !prevClaimsRef.current.some(prevClaim => prevClaim.id === claim.id)
                return (
                    <div
                        key={`${claim.claim_type}-${claim.id}`}
                        className={`
                            mb-5 pb-2.5 border-b border-gray-300 overflow-hidden
                            ${isNew ? 'animate-slide-down' : ''}
                            ${animatingOut && index === 3 ? 'animate-fade-out' : ''}
                        `}
                    >
                        <div className="flex items-center">
                            <p>
                                <Link
                                    className="font-bold"
                                    href={`http://localhost:3000/user/${claim.username}/claimed`}
                                >
                                    {claim.username}
                                </Link>{' '}
                                resgatou o {claim.claim_type === 'channel' ? 'canal' : 'artista'}{' '}
                                {claim.entity_name} com {claim.count_at_claim}{' '}
                                {claim.claim_type === 'channel' ? 'inscritos' : 'de popularidade'}
                            </p>{' '}
                            <img
                                src={claim.profile_image_url}
                                alt={`${claim.entity_name} logo`}
                                className="w-10 h-10 rounded-full ml-2"
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}