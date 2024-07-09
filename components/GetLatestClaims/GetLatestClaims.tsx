'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Claim {
    id: number;
    subscriber_count_at_claim: number;
    claim_date: string;
    profiles: {
      username: string;
    };
    channels: {
      channel_name: string;
      profile_image_url: string;
      current_subscribers_count: number;
    };
  }


export default function GetLatestClaims() {
    const supabase = createClient()
    const [claims, setClaims] = useState<Claim[]>([])

    useEffect(() => {
        async function fetchClaims() {
            const { data, error } = await supabase
                .from('userchannelclaims')
                .select(`
                    *,
                    profiles:user_id (username),
                    channels:channel_id (channel_name, profile_image_url, current_subscribers_count)
                `)
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
        <main>
            <div>
                <h1>Últimas Reivindicações</h1>
                {claims.map((claim) => (
                    <div key={claim.id} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                        <img 
                            src={claim.channels.profile_image_url} 
                            alt={`${claim.channels.channel_name} logo`} 
                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                        />
                        <p>
                            {claim.profiles.username} resgatou o canal {claim.channels.channel_name} com{' '}
                            {claim.subscriber_count_at_claim} inscritos
                        </p>
                        <p>Data da reivindicação: {new Date(claim.claim_date).toLocaleString()}</p>
                        <p>Inscritos atuais: {claim.channels.current_subscribers_count}</p>
                    </div>
                ))}
            </div>
        </main>
    )
}