'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

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

const API_KEY = `${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!}`

export default function ClaimChannel() {
    const supabase = createClient()
    const [loggedUser, setLoggedUser] = useState<string | null>(null)
    const [authStateChangedComplete, setAuthStateChangedComplete] =
        useState(false)
    const [channelData, setChannelData] = useState<ChannelData | null>(null)
    const [channelInput, setChannelInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [userIds, setUserIds] = useState<string[]>([])
    const [error, setError] = useState('')
    const [isAuthChecked, setIsAuthChecked] = useState(false)

    useEffect(() => {
        fetchChannelInfo()
    }, [])

    //fetch o usuario atual logado
    const fetchChannelInfo = async () => {
        try {
            const { data, error } = await supabase.auth.getUser()
            const username = data.user?.user_metadata?.sub

            if (error) {
                throw error
            }

            if (data) {
                setUserIds(username)
                setLoggedUser(username)
            }
        } catch (error) {
            console.log('nao deu pra fazer fetch de usuario', error)
        } finally {
            setIsAuthChecked(true)
        }
    }

    const extractChannelUsername = (input: string) => {
        const urlMatch = input.match(/youtube\.com\/@([^\/]+)/)
        if (urlMatch) return urlMatch[1]
        return input.replace('@', '') // Remove @ if present for direct usernames
    }

    const fetchChannelInformation = async () => {
        if (!loggedUser) {
            console.log('Usuário não autenticado.')
            return
        }

        try {
            if (!loggedUser) {
                throw new Error('UID do usuário não encontrado.')
            }

            const { data: users, error: usersError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', loggedUser)
                .single()

            if (usersError) {
                throw usersError
            }
            const user_id = users ? users.id : null

            setIsLoading(true)
            setError('')
            setSuccessMessage('')
            const channelUsername = extractChannelUsername(channelInput)
            if (!channelUsername) {
                setError('Invalid input')
                setIsLoading(false)
                return
            }

            try {
                // First, try to fetch by username
                let response = await fetch(
                    `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${channelUsername}&key=${API_KEY}`
                )
                let data = await response.json()

                // If no results, try to fetch by custom URL
                if (!data.items || data.items.length === 0) {
                    response = await fetch(
                        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channelUsername}&type=channel&key=${API_KEY}`
                    )
                    data = await response.json()

                    if (!data.items || data.items.length === 0) {
                        throw new Error('Canal não encontrado')
                    }

                    // Use the channel ID from search to get exact channel data
                    const channelId = data.items[0].id.channelId
                    response = await fetch(
                        `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`
                    )
                    data = await response.json()
                }

                if (!data.items || data.items.length === 0) {
                    throw new Error('Canal não encontrado')
                }

                const channelInfo = data.items[0]
                setChannelData(channelInfo)

                // Fetch subscriber count
                const statsResponse = await fetch(
                    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelInfo.id}&key=${API_KEY}`
                )
                const statsData = await statsResponse.json()
                const subscriberCount =
                    statsData.items[0].statistics.subscriberCount

                // Check if channel exists in Channels table
                const { data: existingChannels, error: checkError } =
                    await supabase
                        .from('channels')
                        .select()
                        .eq('id', channelInfo.id)

                if (checkError) {
                    console.error('Error checking channel:', checkError)
                    throw new Error(
                        `Error checking channel: ${checkError.message}`
                    )
                }

                let existingChannel: Channel | null = null
                if (existingChannels && existingChannels.length > 0) {
                    existingChannel = existingChannels[0] as Channel
                }

                if (!existingChannel) {
                    // Channel doesn't exist, so create it
                    const { data: newChannel, error: insertError } =
                        await supabase
                            .from('channels')
                            .insert({
                                id: channelInfo.id,
                                channel_url: `https://www.youtube.com/channel/${channelInfo.id}`,
                                profile_image_url:
                                    channelInfo.snippet.thumbnails.default.url,
                                channel_name: channelInfo.snippet.title,
                                creation_date: new Date(
                                    channelInfo.snippet.publishedAt
                                )
                                    .toISOString()
                                    .split('T')[0],
                                current_subscribers_count:
                                    parseInt(subscriberCount),
                                last_updated: new Date().toISOString(),
                            })
                            .select()
                            .single()

                    if (insertError) {
                        console.error('Error creating channel:', insertError)
                        throw new Error(
                            `Error creating channel: ${insertError.message}`
                        )
                    }

                    existingChannel = newChannel
                } else {
                    // Channel exists, update subscriber count and last_updated
                    const { data: updatedChannel, error: updateError } =
                        await supabase
                            .from('channels')
                            .update({
                                current_subscribers_count:
                                    parseInt(subscriberCount),
                                last_updated: new Date().toISOString(),
                            })
                            .eq('id', channelInfo.id)
                            .select()
                            .single()

                    if (updateError) {
                        console.error('Error updating channel:', updateError)
                        throw new Error(
                            `Error updating channel: ${updateError.message}`
                        )
                    }

                    existingChannel = updatedChannel
                }

                // Now you can use existingChannel safely
                console.log('Channel:', existingChannel)

                // Check if user has already claimed this channel
                const { data: existingClaim, error: claimCheckError } =
                    await supabase
                        .from('userchannelclaims')
                        .select()
                        .eq('user_id', user_id)
                        .eq('channel_id', channelInfo.id)

                if (claimCheckError) {
                    throw new Error('Error checking existing claim')
                }

                if (existingClaim && existingClaim.length > 0) {
                    setSuccessMessage('You have already claimed this channel')
                } else {
                    // Create the user claim
                    const { error: claimError } = await supabase
                        .from('userchannelclaims')
                        .insert({
                            user_id: user_id,
                            channel_id: channelInfo.id,
                            subscriber_count_at_claim:
                                parseInt(subscriberCount),
                        })

                    if (claimError) {
                        throw new Error('Error storing claim')
                    }

                    setSuccessMessage('Channel claimed successfully!')
                }
            } catch (error) {
                console.error('Error:', error)
                setChannelData(null)
                setError(
                    error instanceof Error
                        ? error.message
                        : 'An unknown error occurred'
                )
            } finally {
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Erro ao reinvidicar vídeo:', error)
        }
    }

    return (
        <div>
            <div className="h-fit w-fit bg-red-200 p-4">
                <h2 className="mb-4 text-xl font-bold">
                    Buscar Informações do Canal do YouTube
                </h2>
                <input
                    type="text"
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    placeholder="Enter YouTube channel URL or username"
                    className="mb-4 w-full rounded border border-gray-300 p-2"
                />
                <button
                    className="rounded bg-blue-500 p-2 text-white"
                    onClick={fetchChannelInformation}
                    disabled={isLoading}
                >
                    {isLoading ? 'Buscando...' : 'Buscar'}
                </button>
                {error && <p className="mt-2 text-red-500">{error}</p>}
                {successMessage && (
                    <p className="mt-2 text-green-500">{successMessage}</p>
                )}
                {channelData && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">
                            {channelData.snippet.title}
                        </h3>
                        <p>Channel ID: {channelData.id}</p>
                        <p>Published At: {channelData.snippet.publishedAt}</p>
                        <img
                            src={channelData.snippet.thumbnails.default.url}
                            alt="Channel Thumbnail"
                            className="mt-2"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
