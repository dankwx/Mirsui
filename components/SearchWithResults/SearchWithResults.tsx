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
    images?: { url: string }[]
    followers?: { total: number }
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
    const abortRef = useRef<AbortController | null>(null)
    const router = useRouter()

    // Função para buscar no Spotify
    const searchSpotify = useCallback(async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults(null)
            setShowResults(false)
            return
        }

        // Cancela a requisição anterior para evitar respostas fora de ordem
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setIsLoading(true)
        try {
            // Ajustar parâmetros de busca baseado no filtro
            let typeParam = 'track,artist'
            if (searchFilter === 'tracks') typeParam = 'track'
            if (searchFilter === 'artists') typeParam = 'artist'

            const response = await fetch(
                `/api/search?q=${encodeURIComponent(searchQuery)}&limit=8&type=${typeParam}`,
                { signal: controller.signal }
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
            // Requisição cancelada por uma busca mais recente — ignora
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            console.error('Erro ao buscar:', error)
            setResults(null)
        } finally {
            // Só desliga o loading se esta ainda for a requisição atual
            if (abortRef.current === controller) {
                setIsLoading(false)
            }
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
            abortRef.current?.abort()
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
            <div className="relative flex h-11 items-stretch overflow-hidden rounded-full border border-mir-line bg-mir-fill1 transition-colors focus-within:border-mir-line2 focus-within:bg-mir-fill2">
                {/* Botão de filtro */}
                <div ref={filterRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex h-full items-center gap-1.5 border-r border-mir-line px-3 text-sm font-semibold text-mir-text2 transition-colors hover:bg-mir-fill2 hover:text-mir-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mir-acc/60"
                    >
                        {searchFilter === 'all' && <Filter className="h-4 w-4" />}
                        {searchFilter === 'tracks' && <Music className="h-4 w-4" />}
                        {searchFilter === 'artists' && <User className="h-4 w-4" />}
                        <ChevronDown className="h-3.5 w-3.5 text-mir-text3" />
                    </button>

                    {/* Menu de filtros */}
                    {showFilterMenu && (
                        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-44 overflow-hidden rounded-xl border border-mir-line bg-mir-surface p-1 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
                            <button
                                onClick={() => {
                                    setSearchFilter('all')
                                    setShowFilterMenu(false)
                                }}
                                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-mir-text2 transition-colors duration-200 hover:bg-mir-fill2 hover:text-mir-text ${searchFilter === 'all' ? 'bg-mir-fill2 text-mir-text' : ''}`}
                            >
                                <Filter className="h-4 w-4" />
                                Tudo
                            </button>
                            <button
                                onClick={() => {
                                    setSearchFilter('tracks')
                                    setShowFilterMenu(false)
                                }}
                                className={`mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-mir-text2 transition-colors duration-200 hover:bg-mir-fill2 hover:text-mir-text ${searchFilter === 'tracks' ? 'bg-mir-fill2 text-mir-text' : ''}`}
                            >
                                <Music className="h-4 w-4" />
                                Músicas
                            </button>
                            <button
                                onClick={() => {
                                    setSearchFilter('artists')
                                    setShowFilterMenu(false)
                                }}
                                className={`mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-mir-text2 transition-colors duration-200 hover:bg-mir-fill2 hover:text-mir-text ${searchFilter === 'artists' ? 'bg-mir-fill2 text-mir-text' : ''}`}
                            >
                                <User className="h-4 w-4" />
                                Artistas
                            </button>
                        </div>
                    )}
                </div>

                {/* Campo de busca */}
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-mir-text3" />
                    <Input
                        type="search"
                        placeholder={getPlaceholderText(searchFilter)}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => results && setShowResults(true)}
                        className="h-full rounded-none border-none bg-transparent pl-9 pr-10 text-sm text-mir-text placeholder:text-mir-text3 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {isLoading && (
                        <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-mir-text3" />
                    )}
                </div>
            </div>

            {/* Dropdown de resultados */}
            {showResults && results && query.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-40 max-h-96 overflow-y-auto rounded-xl border border-mir-line bg-mir-surface shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
                    {/* Tracks - só mostra se o filtro permitir */}
                    {(searchFilter === 'all' || searchFilter === 'tracks') &&
                        results.tracks?.items &&
                        results.tracks.items.length > 0 && (
                            <div className="p-3">
                                {searchFilter === 'all' && (
                                    <div className="flex items-center gap-2 px-2 pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-mir-text3">
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
                                            className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-200 hover:bg-mir-fill2"
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
                                                    <div className="flex h-full w-full items-center justify-center bg-mir-fill2">
                                                        <Music className="h-4 w-4 text-mir-text3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-mir-text">
                                                    {track.name}
                                                </span>
                                                <span className="block truncate text-xs text-mir-text2">
                                                    {track.artists
                                                        .map(
                                                            (artist) =>
                                                                artist.name
                                                        )
                                                        .join(', ')}{' '}
                                                    • {track.album.name}
                                                </span>
                                            </div>
                                            <span className="flex-shrink-0 font-mono text-[11px] text-mir-text3">
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
                            <div className={`p-3 ${searchFilter === 'all' && results.tracks?.items?.length ? 'border-t border-mir-line' : ''}`}>
                                {searchFilter === 'all' && (
                                    <div className="flex items-center gap-2 px-2 pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-mir-text3">
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
                                            className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-200 hover:bg-mir-fill2"
                                        >
                                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                                                {artist.images?.[0]?.url ? (
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
                                                    <div className="flex h-full w-full items-center justify-center bg-mir-fill2">
                                                        <User className="h-4 w-4 text-mir-text3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-mir-text">
                                                    {artist.name}
                                                </span>
                                                {artist.followers?.total != null && (
                                                    <span className="block text-xs text-mir-text2">
                                                        {artist.followers.total.toLocaleString()} seguidores
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        )}

                    {/* Nenhum resultado */}
                    {((searchFilter === 'all' && !results.tracks?.items?.length && !results.artists?.items?.length) ||
                      (searchFilter === 'tracks' && !results.tracks?.items?.length) ||
                      (searchFilter === 'artists' && !results.artists?.items?.length)) && (
                            <div className="p-4 text-center text-sm text-mir-text2">
                                Nenhum resultado encontrado para &quot;{query}&quot;
                            </div>
                        )}
                </div>
            )}
        </div>
    )
}
