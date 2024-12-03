'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface ArtistData {
    id: string
    name: string
    images: { url: string }[]
    followers: { total: number }
    popularity: number
}

interface Artist {
    id: string
    artist_url: string
    artist_image_url: string
    artist_name: string
    creation_date: string
    current_popularity: number
    last_updated: string
}

export default function ClaimArtist() {
    const supabase = createClient()
    const [loggedUser, setLoggedUser] = useState<string | null>(null)
    const [artistData, setArtistData] = useState<ArtistData | null>(null)
    const [artistInput, setArtistInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [error, setError] = useState('')
    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const [accessToken, setAccessToken] = useState<string | null>(null)

    useEffect(() => {
        fetchUserInfo()
        getSpotifyToken()
    }, [])

    const fetchUserInfo = async () => {
        try {
            const { data, error } = await supabase.auth.getUser()
            const username = data.user?.user_metadata?.sub

            if (error) {
                throw error
            }

            if (data) {
                setLoggedUser(username)
            }
        } catch (error) {
            console.log('Falha ao buscar informações do usuário', error)
        } finally {
            setIsAuthChecked(true)
        }
    }

    const getSpotifyToken = async () => {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
        const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
            },
            body: 'grant_type=client_credentials',
        })

        const data = await response.json()
        setAccessToken(data.access_token)
    }

    const extractArtistId = (input: string) => {
        const urlMatch = input.match(/spotify\.com\/artist\/([a-zA-Z0-9]+)/)
        return urlMatch ? urlMatch[1] : input
    }

    const fetchArtistInformation = async () => {
        if (!loggedUser) {
            console.log('Usuário não autenticado.')
            return
        }

        if (!accessToken) {
            console.log('Token do Spotify não disponível.')
            return
        }

        try {
            setIsLoading(true)
            setError('')
            setSuccessMessage('')
            const artistId = extractArtistId(artistInput)

            const response = await fetch(
                `https://api.spotify.com/v1/artists/${artistId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Artista não encontrado')
            }

            const artistInfo: ArtistData = await response.json()
            setArtistData(artistInfo)

            // Check if artist exists in Artists table
            const { data: existingArtists, error: checkError } = await supabase
                .from('artists')
                .select()
                .eq('id', artistInfo.id)

            if (checkError) {
                throw new Error(`Error checking artist: ${checkError.message}`)
            }

            let existingArtist: Artist | null = null
            if (existingArtists && existingArtists.length > 0) {
                existingArtist = existingArtists[0] as Artist
            }

            if (!existingArtist) {
                // Artist doesn't exist, so create it
                const { data: newArtist, error: insertError } = await supabase
                    .from('artists')
                    .insert({
                        id: artistInfo.id,
                        artist_url: `https://open.spotify.com/artist/${artistInfo.id}`,
                        artist_image_url: artistInfo.images[0]?.url || '',
                        artist_name: artistInfo.name,
                        creation_date: new Date().toISOString().split('T')[0],
                        current_popularity: artistInfo.popularity,
                        last_updated: new Date().toISOString(),
                    })
                    .select()
                    .single()

                if (insertError) {
                    throw new Error(
                        `Error creating artist: ${insertError.message}`
                    )
                }

                existingArtist = newArtist
            } else {
                // Artist exists, update popularity and last_updated
                const { data: updatedArtist, error: updateError } =
                    await supabase
                        .from('artists')
                        .update({
                            current_popularity: artistInfo.popularity,
                            last_updated: new Date().toISOString(),
                        })
                        .eq('id', artistInfo.id)
                        .select()
                        .single()

                if (updateError) {
                    throw new Error(
                        `Error updating artist: ${updateError.message}`
                    )
                }

                existingArtist = updatedArtist
            }

            // Check if user has already claimed this artist
            const { data: existingClaim, error: claimCheckError } =
                await supabase
                    .from('userartistclaims')
                    .select()
                    .eq('user_id', loggedUser)
                    .eq('artist_id', artistInfo.id)

            if (claimCheckError) {
                throw new Error('Error checking existing claim')
            }

            if (existingClaim && existingClaim.length > 0) {
                setSuccessMessage('You have already claimed this artist')
            } else {
                // Create the user claim
                const { error: claimError } = await supabase
                    .from('userartistclaims')
                    .insert({
                        user_id: loggedUser,
                        artist_id: artistInfo.id,
                        popularity_at_claim: artistInfo.popularity,
                    })

                if (claimError) {
                    throw new Error('Error storing claim')
                }

                setSuccessMessage('Artist claimed successfully!')
            }
        } catch (error) {
            console.error('Error:', error)
            setArtistData(null)
            setError(
                error instanceof Error
                    ? error.message
                    : 'An unknown error occurred'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div className="h-fit w-fit bg-green-200 p-4">
                <h2 className="mb-4 text-xl font-bold">
                    Buscar Informações do Artista do Spotify
                </h2>
                <input
                    type="text"
                    value={artistInput}
                    onChange={(e) => setArtistInput(e.target.value)}
                    placeholder="Enter Spotify artist URL or ID"
                    className="mb-4 w-full rounded border border-gray-300 p-2"
                />
                <button
                    className="rounded bg-green-500 p-2 text-white"
                    onClick={fetchArtistInformation}
                    disabled={isLoading}
                >
                    {isLoading ? 'Buscando...' : 'Buscar'}
                </button>
                {error && <p className="mt-2 text-red-500">{error}</p>}
                {successMessage && (
                    <p className="mt-2 text-green-500">{successMessage}</p>
                )}
                {artistData && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">
                            {artistData.name}
                        </h3>
                        <p>Artist ID: {artistData.id}</p>
                        <p>Followers: {artistData.followers.total}</p>
                        <p>Popularity: {artistData.popularity}</p>
                        {artistData.images[0] && (
                            <img
                                src={artistData.images[0].url}
                                alt="Artist Image"
                                className="mt-2 h-32 w-32"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
