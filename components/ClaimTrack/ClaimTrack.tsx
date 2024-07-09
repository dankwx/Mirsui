'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export interface UserTrack {
    track_url: string
    track_title: string
    artist_name: string
    album_name: string
    popularity: number
    track_thumbnail: string
    position: number
    claimedat: Date
}

export default function ClaimTrack() {
    const [loggedUser, setLoggedUser] = useState<string | null>(null)
    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const [trackUrl, setTrackUrl] = useState('')
    const [userTracks, setUserTracks] = useState<UserTrack[]>([])
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
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        })

        const data = await response.json()
        setAccessToken(data.access_token)
    }

    const handleClaimTrack = async () => {
        if (!loggedUser) {
            console.log('Usuário não autenticado.')
            return
        }

        if (!accessToken) {
            console.log('Token do Spotify não disponível.')
            return
        }

        try {

            const { data: users, error: usersError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', loggedUser)
                .single()

            if (usersError) {
                throw usersError
            }
            const user_id = users ? users.id : null


            // Extrair o ID da faixa do URL do Spotify
            const trackIdRegex = /(?:https:\/\/open\.spotify\.com\/track\/)([a-zA-Z0-9]+)/
            const match = trackUrl.match(trackIdRegex)

            if (!match || !match[1]) {
                throw new Error('URL do Spotify inválida.')
            }

            const trackId = match[1]
            
            const trackInfo = await fetchTrackInfo(trackId)

            // Consulta para contar quantas vezes a track_url já foi inserida
            const { count: trackCount, error: countError } = await supabase
                .from('tracks')
                .select('*', { count: 'exact' })
                .eq('track_url', trackUrl)

            if (countError) {
                throw countError
            }

            // A próxima posição será a contagem atual + 1
            const nextPosition = trackCount !== null ? trackCount + 1 : 1

            // Construir objeto UserTrack
            const newTrack: UserTrack = {
                track_url: trackUrl,
                track_title: trackInfo.name,
                artist_name: trackInfo.artists[0].name,
                album_name: trackInfo.album.name,
                popularity: trackInfo.popularity,
                track_thumbnail: trackInfo.album.images[0].url,
                position: nextPosition,
                claimedat: new Date(),
            }

            // Inserir no banco de dados Supabase
            const { data: insertedTrack, error } = await supabase
                .from('tracks')
                .insert([
                    {
                        track_url: newTrack.track_url,
                        track_title: newTrack.track_title,
                        artist_name: newTrack.artist_name,
                        album_name: newTrack.album_name,
                        popularity: newTrack.popularity,
                        track_thumbnail: newTrack.track_thumbnail,
                        user_id: user_id,
                        position: newTrack.position,
                        claimedat: newTrack.claimedat
                            .toISOString()
                            .slice(0, 19)
                            .replace('T', ' '), // Formato YYYY-MM-DD HH:mm:ss
                    },
                ])

            if (error) {
                throw error
            }

            console.log('Faixa reinvidicada com sucesso:', insertedTrack)
            setTrackUrl('') // Limpar campo de input após inserção bem-sucedida
        } catch (error) {
            console.error('Erro ao reinvidicar faixa:', error)
        }
    }

    const fetchTrackInfo = async (trackId: string) => {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        if (!response.ok) {
            throw new Error('Falha ao buscar informações da faixa')
        }

        return await response.json()
    }

    return (
        <main>
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <div className="flex flex-col p-4">
                        <p className="mb-4 text-lg font-semibold">
                            Salvar faixa do Spotify
                        </p>
                        <div className="flex flex-col space-y-2">
                            <input
                                type="text"
                                className="rounded-md border border-gray-300 p-2"
                                placeholder="Insira a URL da faixa do Spotify"
                                value={trackUrl}
                                onChange={(e) => setTrackUrl(e.target.value)}
                            />
                            <button
                                onClick={handleClaimTrack}
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