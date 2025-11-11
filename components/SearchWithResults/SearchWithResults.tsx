'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import { SearchIcon, Music, User, Loader2, ChevronDown, Filter } from 'lucide-react'
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

type SearchFilter = 'all' | 'tracks' | 'artists'

export default function SearchWithResults() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResults | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [searchFilter, setSearchFilter] = useState<SearchFilter>('all')
    const [showFilterMenu, setShowFilterMenu] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const filterRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const router = useRouter()

    // Função para buscar no Spotify
    const searchSpotify = useCallback(async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults(null)
            setShowResults(false)
            return
        }

        setIsLoading(true)
        try {
            // Ajustar parâmetros de busca baseado no filtro
            let typeParam = 'track,artist'
            if (searchFilter === 'tracks') typeParam = 'track'
            if (searchFilter === 'artists') typeParam = 'artist'

            const response = await fetch(
                `/api/search?q=${encodeURIComponent(searchQuery)}&limit=8&type=${typeParam}`
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
    }, [searchFilter])

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
    }, [query, searchFilter, searchSpotify]) // Adicionado searchSpotify como dependência

    // Fechar resultados ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowResults(false)
            }
            if (
                filterRef.current &&
                !filterRef.current.contains(event.target as Node)
            ) {
                setShowFilterMenu(false)
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

    const getFilterLabel = (filter: SearchFilter) => {
        switch (filter) {
            case 'all': return 'Tudo'
            case 'tracks': return 'Músicas'
            case 'artists': return 'Artistas'
            default: return 'Tudo'
        }
    }

    const getPlaceholderText = (filter: SearchFilter) => {
        switch (filter) {
            case 'all': return 'Pesquisar artistas ou músicas...'
            case 'tracks': return 'Pesquisar músicas...'
            case 'artists': return 'Pesquisar artistas...'
            default: return 'Pesquisar artistas ou músicas...'
        }
    }

    return (
        <div
            ref={searchRef}
            className="group relative w-full"
        >
            <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_top,_rgba(136,99,241,0.35),_transparent_55%),_linear-gradient(120deg,_rgba(86,51,221,0.4),_rgba(12,18,39,0))] opacity-0 blur-3xl transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100" />
            <div className="relative flex h-12 items-stretch rounded-[18px] border border-white/10 bg-white/[0.04] shadow-[0_30px_60px_-20px_rgba(94,61,237,0.65)] backdrop-blur-2xl">
                {/* Botão de filtro */}
                <div ref={filterRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex h-full items-center gap-2 border-r border-white/10 bg-white/[0.04] px-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/60 transition-colors duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-0"
                    >
                        {searchFilter === 'all' && <Filter className="h-4 w-4 text-purple-200/80" />}
                        {searchFilter === 'tracks' && <Music className="h-4 w-4 text-purple-200/80" />}
                        {searchFilter === 'artists' && <User className="h-4 w-4 text-purple-200/80" />}
                        <span className="hidden sm:inline">{getFilterLabel(searchFilter)}</span>
                        <ChevronDown className="h-3 w-3 text-white/50" />
                    </button>

                    {/* Menu de filtros */}
                    {showFilterMenu && (
                        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1324]/95 p-1 shadow-[0_24px_50px_-20px_rgba(40,20,120,0.7)] backdrop-blur-xl">
                            <button
                                onClick={() => {
                                    setSearchFilter('all')
                                    setShowFilterMenu(false)
                                }}
                                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 transition-colors duration-200 hover:bg-white/10 ${searchFilter === 'all' ? 'bg-white/10 text-white' : ''}`}
                            >
                                <Filter className="h-4 w-4" />
                                Tudo
                            </button>
                            <button
                                onClick={() => {
                                    setSearchFilter('tracks')
                                    setShowFilterMenu(false)
                                }}
                                className={`mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 transition-colors duration-200 hover:bg-white/10 ${searchFilter === 'tracks' ? 'bg-white/10 text-white' : ''}`}
                            >
                                <Music className="h-4 w-4" />
                                Músicas
                            </button>
                            <button
                                onClick={() => {
                                    setSearchFilter('artists')
                                    setShowFilterMenu(false)
                                }}
                                className={`mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 transition-colors duration-200 hover:bg-white/10 ${searchFilter === 'artists' ? 'bg-white/10 text-white' : ''}`}
                            >
                                <User className="h-4 w-4" />
                                Artistas
                            </button>
                        </div>
                    )}
                </div>

                {/* Campo de busca */}
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <Input
                        type="search"
                        placeholder={getPlaceholderText(searchFilter)}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => results && setShowResults(true)}
                        className="h-full rounded-none border-none bg-transparent pl-10 pr-12 text-sm text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-0"
                    />
                    {isLoading && (
                        <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/40" />
                    )}
                </div>
            </div>

            {/* Dropdown de resultados */}
            {showResults && results && query.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-40 max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1120]/95 shadow-[0_30px_80px_-35px_rgba(94,61,237,0.9)] backdrop-blur-2xl">
                    {/* Tracks - só mostra se o filtro permitir */}
                    {(searchFilter === 'all' || searchFilter === 'tracks') &&
                        results.tracks?.items &&
                        results.tracks.items.length > 0 && (
                            <div className="p-3">
                                {searchFilter === 'all' && (
                                    <div className="flex items-center gap-2 px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
                                        <Music className="h-3 w-3" />
                                        Músicas
                                    </div>
                                )}
                                {results.tracks.items
                                    .slice(0, searchFilter === 'tracks' ? 8 : 5)
                                    .map((track) => (
                                        <button
                                            key={track.id}
                                            type="button"
                                            onClick={() =>
                                                handleTrackClick(track)
                                            }
                                            className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-200 hover:bg-white/8"
                                        >
                                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                                                {track.album.images[0] ? (
                                                    <Image
                                                        src={
                                                            track.album
                                                                .images[0]
                                                                .url
                                                        }
                                                        alt={track.album.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-white/10">
                                                        <Music className="h-4 w-4 text-white/40" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-white">
                                                    {track.name}
                                                </span>
                                                <span className="block truncate text-xs text-white/50">
                                                    {track.artists
                                                        .map(
                                                            (artist) =>
                                                                artist.name
                                                        )
                                                        .join(', ')}{' '}
                                                    • {track.album.name}
                                                </span>
                                            </div>
                                            <span className="flex-shrink-0 text-xs text-white/40">
                                                {formatDuration(
                                                    track.duration_ms
                                                )}
                                            </span>
                                        </button>
                                    ))}
                            </div>
                        )}

                    {/* Artists - só mostra se o filtro permitir */}
                    {(searchFilter === 'all' || searchFilter === 'artists') &&
                        results.artists?.items &&
                        results.artists.items.length > 0 && (
                            <div className={`p-3 ${searchFilter === 'all' && results.tracks?.items?.length ? 'border-t border-white/5' : ''}`}>
                                {searchFilter === 'all' && (
                                    <div className="flex items-center gap-2 px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
                                        <User className="h-3 w-3" />
                                        Artistas
                                    </div>
                                )}
                                {results.artists.items
                                    .slice(0, searchFilter === 'artists' ? 8 : 3)
                                    .map((artist) => (
                                        <button
                                            key={artist.id}
                                            type="button"
                                            onClick={() =>
                                                handleArtistClick(artist)
                                            }
                                            className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-200 hover:bg-white/8"
                                        >
                                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                                                {artist.images[0] ? (
                                                    <Image
                                                        src={
                                                            artist.images[0]
                                                                .url
                                                        }
                                                        alt={artist.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-white/10">
                                                        <User className="h-4 w-4 text-white/40" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-white">
                                                    {artist.name}
                                                </span>
                                                <span className="block text-xs text-white/50">
                                                    {artist.followers.total.toLocaleString()} seguidores
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        )}

                    {/* Nenhum resultado */}
                    {((searchFilter === 'all' && !results.tracks?.items?.length && !results.artists?.items?.length) ||
                      (searchFilter === 'tracks' && !results.tracks?.items?.length) ||
                      (searchFilter === 'artists' && !results.artists?.items?.length)) && (
                            <div className="p-4 text-center text-sm text-white/50">
                                Nenhum resultado encontrado para &quot;{query}&quot;
                            </div>
                        )}
                </div>
            )}
        </div>
    )
}
