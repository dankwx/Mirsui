'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'

interface ChannelData {
    snippet: {
        title: string
        publishedAt: string
        thumbnails: {
            default: {
                url: string
            }
        }
    }
    id: string
}

interface Channel {
    id: string
    channel_url: string
    profile_image_url: string
    channel_name: string
    creation_date: string
    current_subscribers_count: number
    last_updated: string
}

export default function NewGetChannel() {
    const supabase = createClientComponentClient()
    const [userIds, setUserIds] = useState<string[]>([])

    useEffect(() => {
        fetchChannelInfo()
    }, [])

    const fetchChannelInfo = async () => {
        try {
            const { data: profiles, error: usersError } = await supabase
                .from('profiles')
                .select('username')

            if (usersError) {
                throw usersError
            }

            if (profiles) {
                setUserIds(profiles.map((profile) => profile.username))
            }
        } catch (error) {
            console.error('Error fetching user IDs:', error)
        }
    }

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div>
                <p>User IDs:</p>
                <ul>
                    {userIds.map((id) => (
                        <li key={id}>{id}</li>
                    ))}
                </ul>
            </div>
        </main>
    )
}
