'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import { SearchIcon, Music, User, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface SpotifyTrack {
    album: {
        name: string
        images: { url: string }[]
        release_date: string
    }
    artists: { name: string }[]
    name: string
    popularity: number
    uri: string
    duration_ms: number
    id: string
}

interface SpotifyArtist {
    id: string
    name: string
    images: { url: string }[]
    followers: { total: number }
    genres: string[]
}

interface SearchResults {
    tracks: {
        items: SpotifyTrack[]
    }
    artists: {
        items: SpotifyArtist[]
    }
}

export default function SearchWithResults() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResults | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const router = useRouter()

    // Função para buscar no Spotify
    const searchSpotify = async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults(null)
            setShowResults(false)
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(
                `/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`
            )

            if (response.ok) {
                const data = await response.json()
                setResults(data)
                setShowResults(true)
            } else {
                console.error('Erro na busca:', response.statusText)
                setResults(null)
            }
        } catch (error) {
            console.error('Erro ao buscar:', error)
            setResults(null)
        } finally {
            setIsLoading(false)
        }
    }

    // Debounce da busca
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            if (query.trim()) {
                searchSpotify(query)
            } else {
                setResults(null)
                setShowResults(false)
            }
        }, 300)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [query])

    // Fechar resultados ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowResults(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleTrackClick = (track: SpotifyTrack) => {
        console.log('Track selecionada:', track)
        setShowResults(false)
        router.push(`/track/${track.id}`)
    }

    const handleArtistClick = (artist: SpotifyArtist) => {
        console.log('Artista selecionado:', artist)
        setShowResults(false)
        router.push(`/artist/${artist.id}`)
    }

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    return (
        <div
            ref={searchRef}
            className="flex w-[500px] items-center align-middle"
        >
            <div className="relative flex w-full max-w-md items-center">
                <SearchIcon className="absolute left-3 z-10 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search a Artist or Track..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results && setShowResults(true)}
                    className="w-full rounded-lg bg-background py-2 pl-10 pr-10 text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}

                {/* Dropdown de resultados */}
                {showResults && results && query.trim().length >= 2 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                        {/* Tracks */}
                        {results.tracks?.items &&
                            results.tracks.items.length > 0 && (
                                <div className="p-2">
                                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <Music className="h-3 w-3" />
                                        Músicas
                                    </div>
                                    {results.tracks.items
                                        .slice(0, 5)
                                        .map((track) => (
                                            <div
                                                key={track.id}
                                                onClick={() =>
                                                    handleTrackClick(track)
                                                }
                                                className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-50"
                                            >
                                                <div className="relative h-10 w-10 flex-shrink-0">
                                                    {track.album.images[0] ? (
                                                        <Image
                                                            src={
                                                                track.album
                                                                    .images[0]
                                                                    .url
                                                            }
                                                            alt={
                                                                track.album.name
                                                            }
                                                            fill
                                                            className="rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                                                            <Music className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-grow">
                                                    <div className="truncate text-sm font-medium">
                                                        {track.name}
                                                    </div>
                                                    <div className="truncate text-xs text-gray-500">
                                                        {track.artists
                                                            .map(
                                                                (artist) =>
                                                                    artist.name
                                                            )
                                                            .join(', ')}{' '}
                                                        • {track.album.name}
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 text-xs text-gray-400">
                                                    {formatDuration(
                                                        track.duration_ms
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                        {/* Artists */}
                        {results.artists?.items &&
                            results.artists.items.length > 0 && (
                                <div className="border-t border-gray-100 p-2">
                                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <User className="h-3 w-3" />
                                        Artistas
                                    </div>
                                    {results.artists.items
                                        .slice(0, 3)
                                        .map((artist) => (
                                            <div
                                                key={artist.id}
                                                onClick={() =>
                                                    handleArtistClick(artist)
                                                }
                                                className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-50"
                                            >
                                                <div className="relative h-10 w-10 flex-shrink-0">
                                                    {artist.images[0] ? (
                                                        <Image
                                                            src={
                                                                artist.images[0]
                                                                    .url
                                                            }
                                                            alt={artist.name}
                                                            fill
                                                            className="rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-grow">
                                                    <div className="truncate text-sm font-medium">
                                                        {artist.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {artist.followers.total.toLocaleString()}{' '}
                                                        seguidores
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                        {/* Nenhum resultado */}
                        {!results.tracks?.items?.length &&
                            !results.artists?.items?.length && (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    Nenhum resultado encontrado para &#34{query}
                                    &#34
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    )
}
