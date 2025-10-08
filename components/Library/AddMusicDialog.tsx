'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { SearchIcon, Music, Loader2, Plus, Check } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/ui/use-toast'
import { addTrackToPlaylist } from '@/utils/libraryService.client'

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

interface AddMusicDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    playlistId: string
    playlistName: string
    onTrackAdded: () => void
}

export default function AddMusicDialog({ 
    open, 
    onOpenChange, 
    playlistId, 
    playlistName,
    onTrackAdded 
}: AddMusicDialogProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResults | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [addingTracks, setAddingTracks] = useState<Set<string>>(new Set())
    const [addedTracks, setAddedTracks] = useState<Set<string>>(new Set())
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    
    const { toast } = useToast()

    // Função para buscar músicas no Spotify
    const searchTracks = async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults(null)
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
                searchTracks(query)
            } else {
                setResults(null)
            }
        }, 300)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [query])

    // Limpar estado quando o dialog fechar
    useEffect(() => {
        if (!open) {
            setQuery('')
            setResults(null)
            setAddingTracks(new Set())
            setAddedTracks(new Set())
        }
    }, [open])

    const handleAddTrack = async (track: SpotifyTrack) => {
        const trackId = track.id
        
        if (addingTracks.has(trackId) || addedTracks.has(trackId)) {
            return
        }

        setAddingTracks(prev => new Set(prev).add(trackId))

        try {
            const success = await addTrackToPlaylist(playlistId, {
                track_title: track.name,
                artist_name: track.artists.map(a => a.name).join(', '),
                album_name: track.album.name,
                track_thumbnail: track.album.images[0]?.url,
                track_url: `https://open.spotify.com/track/${track.id}`,
                duration: formatDuration(track.duration_ms)
            })

            if (success) {
                setAddedTracks(prev => new Set(prev).add(trackId))
                toast({
                    title: "Success",
                    description: `"${track.name}" added to playlist!`
                })
                onTrackAdded() // Callback para atualizar a UI parent
            } else {
                toast({
                    title: "Error",
                    description: "Failed to add track to playlist",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error adding track:', error)
            toast({
                title: "Error",
                description: "Failed to add track to playlist",
                variant: "destructive"
            })
        } finally {
            setAddingTracks(prev => {
                const newSet = new Set(prev)
                newSet.delete(trackId)
                return newSet
            })
        }
    }

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add Songs to &quot;{playlistName}&quot;</DialogTitle>
                    <DialogDescription>
                        Search for songs on Spotify and add them to your playlist.
                    </DialogDescription>
                </DialogHeader>

                {/* Campo de busca */}
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search for songs..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 pr-10"
                    />
                    {isLoading && (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                </div>

                {/* Resultados */}
                <div className="flex-1 overflow-y-auto">
                    {results?.tracks?.items && results.tracks.items.length > 0 ? (
                        <div className="space-y-2">
                            {results.tracks.items.map((track) => {
                                const isAdding = addingTracks.has(track.id)
                                const isAdded = addedTracks.has(track.id)
                                
                                return (
                                    <div
                                        key={track.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative h-12 w-12 flex-shrink-0">
                                            {track.album.images[0] ? (
                                                <Image
                                                    src={track.album.images[0].url}
                                                    alt={track.album.name}
                                                    fill
                                                    className="rounded object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                                                    <Music className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Informações da música */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">
                                                {track.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground truncate">
                                                {track.artists.map(a => a.name).join(', ')} • {track.album.name}
                                            </div>
                                        </div>

                                        {/* Duração */}
                                        <div className="text-sm text-muted-foreground flex-shrink-0">
                                            {formatDuration(track.duration_ms)}
                                        </div>

                                        {/* Botão de adicionar */}
                                        <Button
                                            size="sm"
                                            onClick={() => handleAddTrack(track)}
                                            disabled={isAdding || isAdded}
                                            className="flex-shrink-0"
                                        >
                                            {isAdding ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : isAdded ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Added
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : query.trim().length >= 2 && !isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No songs found for &quot;{query}&quot;</p>
                        </div>
                    ) : query.trim().length < 2 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Start typing to search for songs...</p>
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    )
}