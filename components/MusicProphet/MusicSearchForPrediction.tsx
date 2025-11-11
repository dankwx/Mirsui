// components/MusicProphet/MusicSearchForPrediction.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { SearchIcon, Music, Loader2, Check } from 'lucide-react'
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

interface SearchResults {
    tracks: {
        items: SpotifyTrack[]
    }
}

interface MusicSearchForPredictionProps {
    onTrackSelect: (track: SpotifyTrack | null) => void
    selectedTrack: SpotifyTrack | null
}

export default function MusicSearchForPrediction({ 
    onTrackSelect, 
    selectedTrack 
}: MusicSearchForPredictionProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResults | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Função para buscar no Spotify apenas tracks
    const searchSpotify = async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults(null)
            setShowResults(false)
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(
                `/api/search?q=${encodeURIComponent(searchQuery)}&limit=10&type=track`
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

    const handleTrackSelect = (track: SpotifyTrack) => {
        onTrackSelect(track)
        setQuery('')
        setShowResults(false)
        setResults(null)
    }

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const clearSelection = () => {
        onTrackSelect(null)
        setQuery('')
    }

    return (
        <div ref={searchRef} className="w-full space-y-4">
            {/* Música Selecionada */}
            {selectedTrack ? (
                <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex-shrink-0">
                            {selectedTrack.album.images[0] ? (
                                <Image
                                    src={selectedTrack.album.images[0].url}
                                    alt={`${selectedTrack.name} cover`}
                                    fill
                                    className="object-cover rounded"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded flex items-center justify-center">
                                    <Music className="h-6 w-6 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm text-foreground truncate">
                                        {selectedTrack.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {selectedTrack.artists.map(a => a.name).join(', ')}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span>Pop: {selectedTrack.popularity}</span>
                                        <span>{formatDuration(selectedTrack.duration_ms)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    <div className="flex items-center gap-1 text-green-600">
                                        <Check className="h-4 w-4" />
                                        <span className="text-xs font-medium">Selecionada</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={clearSelection}
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                    >
                                        ×
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Campo de Busca */
                <div className="relative">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar música no Spotify..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9 pr-10"
                        />
                        {isLoading && (
                            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {/* Resultados da Busca */}
                    {showResults && results?.tracks?.items && (
                        <div className="mt-3 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                            {results.tracks.items.length > 0 ? (
                                <div className="p-2">
                                    <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                                        Músicas encontradas
                                    </div>
                                    {results.tracks.items.map((track) => (
                                        <button
                                            key={track.id}
                                            onClick={() => handleTrackSelect(track)}
                                            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                                        >
                                            <div className="relative h-10 w-10 flex-shrink-0">
                                                {track.album.images[0] ? (
                                                    <Image
                                                        src={track.album.images[0].url}
                                                        alt={`${track.name} cover`}
                                                        fill
                                                        className="object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-gradient-to-br from-purple-400 to-pink-400 rounded flex items-center justify-center">
                                                        <Music className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium text-foreground">
                                                    {track.name}
                                                </div>
                                                <div className="truncate text-xs text-muted-foreground">
                                                    {track.artists.map(a => a.name).join(', ')}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span>Pop: {track.popularity}</span>
                                                    <span>{formatDuration(track.duration_ms)}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-muted-foreground">
                                    <Music className="mx-auto h-8 w-8 mb-2" />
                                    <p className="text-sm">Nenhuma música encontrada</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}