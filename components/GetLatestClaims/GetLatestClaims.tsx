'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface Claim {
    id: number
    subscriber_count_at_claim: number
    claim_date: string
    profiles: {
        username: string
    }
    channels: {
        channel_name: string
        profile_image_url: string
        current_subscribers_count: number
    }
}

export default function GetLatestClaims() {
    const supabase = createClient()
    const [claims, setClaims] = useState<Claim[]>([])

    useEffect(() => {
        async function fetchClaims() {
            const { data, error } = await supabase
                .from('userchannelclaims')
                .select(
                    `
                    *,
                    profiles:user_id (username),
                    channels:channel_id (channel_name, profile_image_url, current_subscribers_count)
                `
                )
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
            <h1 className="font-sans text-2xl font-bold">
                O que as pessoas estão salvado
            </h1>
            {claims.map((claim) => (
                <div
                    key={claim.id}
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
                                href={`http://localhost:3000/user/${claim.profiles.username}/claimed`}
                            >
                                {claim.profiles.username}
                            </Link>{' '}
                            resgatou o canal {claim.channels.channel_name} com{' '}
                            {claim.subscriber_count_at_claim} inscritos
                        </p>{' '}
                        <img
                            src={claim.channels.profile_image_url}
                            alt={`${claim.channels.channel_name} logo`}
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
