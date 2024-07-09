'use client'

import { useEffect, useState } from 'react'
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

    useEffect(() => {
        async function fetchClaims() {
            const { data, error } = await supabase
                .from('combined_claims')
                .select('*')
                .order('claim_date', { ascending: false })

            if (error) {
                console.error('Error fetching claims:', error)
            } else {
                setClaims(data as Claim[])
            }
        }

        fetchClaims()
    }, [])

    return (
        <div className="p-4 font-sans">
            <h1 className="font-sans text-2xl font-bold">O que as pessoas estão salvando</h1>
            {claims.map((claim) => (
                <div
                    key={`${claim.claim_type}-${claim.id}`}
                    style={{
                        marginBottom: '20px',
                        borderBottom: '1px solid #ccc',
                        paddingBottom: '10px',
                    }}
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
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}