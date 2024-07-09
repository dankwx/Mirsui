'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export interface Artist {
    id: string
    artist_url: string
    artist_image_url: string
    artist_name: string
    creation_date: Date
    current_popularity: number
    last_updated: Date
}

export default function ClaimArtist() {
    const [loggedUser, setLoggedUser] = useState<string | null>(null)
    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const [artistUrl, setArtistUrl] = useState('')
    const [accessToken, setAccessToken] = useState<string | null>(null)

    const supabase = createClient()

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

    const handleClaimArtist = async () => {
        if (!loggedUser) {
            console.log('Usuário não autenticado.')
            return
        }

        if (!accessToken) {
            console.log('Token do Spotify não disponível.')
            return
        }

        if (!isAuthChecked) {
            console.log('Auth check failed')
            return
        }

        try {
            // Extrair o ID do artista do URL do Spotify
            const artistIdRegex =
                /(?:https:\/\/open\.spotify\.com\/artist\/)([a-zA-Z0-9]+)/
            const match = artistUrl.match(artistIdRegex)

            if (!match || !match[1]) {
                throw new Error('URL do Spotify inválida.')
            }

            const artistId = match[1]

            const artistInfo = await fetchArtistInfo(artistId)

            // Construir objeto Artist
            const newArtist: Artist = {
                id: artistId,
                artist_url: artistUrl,
                artist_image_url: artistInfo.images[0]?.url || '',
                artist_name: artistInfo.name,
                creation_date: new Date(),
                current_popularity: artistInfo.popularity,
                last_updated: new Date(),
            }

            // Inserir no banco de dados Supabase
            const { data: insertedArtist, error } = await supabase
                .from('artists')
                .upsert([newArtist], { onConflict: 'id' })

            if (error) {
                throw error
            }

            console.log('Artista reinvidicado com sucesso:', insertedArtist)
            setArtistUrl('') // Limpar campo de input após inserção bem-sucedida
        } catch (error) {
            console.error('Erro ao reinvidicar artista:', error)
        }
    }

    const fetchArtistInfo = async (artistId: string) => {
        const response = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        if (!response.ok) {
            throw new Error('Falha ao buscar informações do artista')
        }

        return await response.json()
    }

    return (
        <main>
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <div className="flex flex-col p-4">
                        <p className="mb-4 text-lg font-semibold">
                            Salvar artista do Spotify
                        </p>
                        <div className="flex flex-col space-y-2">
                            <input
                                type="text"
                                className="rounded-md border border-gray-300 p-2"
                                placeholder="Insira a URL do artista do Spotify"
                                value={artistUrl}
                                onChange={(e) => setArtistUrl(e.target.value)}
                            />
                            <button
                                onClick={handleClaimArtist}
                                className="rounded-md bg-green-500 px-4 py-2 text-white shadow-md hover:bg-green-600"
                            >
                                Reinvidicar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}