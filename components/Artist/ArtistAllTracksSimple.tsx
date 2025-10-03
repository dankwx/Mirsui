'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
    Music, 
    Play, 
    ExternalLink, 
    Search, 
    Filter, 
    Clock,
    Calendar,
    Disc3,
    Star
} from 'lucide-react'
import { extractSpotifyIdFromUri } from '@/lib/spotifyUri'
import { formatDuration, formatReleaseDate, getAlbumTypeLabel } from '@/lib/formatters'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Track {
    id: string
    name: string
    uri: string
    duration_ms: number
    popularity?: number
    album: {
        name: string
        images: { url: string }[]
        release_date: string
        album_type: string
        id: string
    }
    artists: { name: string; id: string }[]
}

interface ArtistAllTracksSimpleProps {
    topTracks: any[]
    albums: any[]
}

export default function ArtistAllTracksSimple({
    topTracks,
    albums,
}: ArtistAllTracksSimpleProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('popularity')
    const [showAll, setShowAll] = useState(false)

    // Create tracks list from top tracks and albums info
    const allTracks = useMemo(() => {
        const tracks: Track[] = []
        
        // Add top tracks (they have popularity and full data)
        topTracks.forEach((track) => {
            tracks.push({
                id: track.id,
                name: track.name,
                uri: track.uri,
                duration_ms: track.duration_ms,
                popularity: track.popularity,
                album: track.album,
                artists: track.artists
            })
        })

        // Add placeholder tracks from albums (without full track data)
        albums.forEach((album) => {
            // Create a simplified track entry for each album
            const albumTrack: Track = {
                id: album.id + '_album',
                name: `${album.name} (Álbum Completo)`,
                uri: `spotify:album:${album.id}`,
                duration_ms: 0,
                popularity: 0,
                album: {
                    name: album.name,
                    images: album.images,
                    release_date: album.release_date,
                    album_type: album.album_type,
                    id: album.id
                },
                artists: album.artists
            }
            
            // Only add if not already in top tracks
            const existsInTopTracks = topTracks.some(track => 
                track.album.id === album.id
            )
            
            if (!existsInTopTracks) {
                tracks.push(albumTrack)
            }
        })

        return tracks
    }, [topTracks, albums])

    // Filter and sort tracks
    const filteredAndSortedTracks = useMemo(() => {
        let filtered = allTracks

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(track =>
                track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                track.album.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Sort tracks
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'popularity':
                    return (b.popularity || 0) - (a.popularity || 0)
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'release_date':
                    return new Date(b.album.release_date).getTime() - new Date(a.album.release_date).getTime()
                case 'duration':
                    return (b.duration_ms || 0) - (a.duration_ms || 0)
                default:
                    return 0
            }
        })
    }, [allTracks, searchQuery, sortBy])

    const displayedTracks = showAll ? filteredAndSortedTracks : filteredAndSortedTracks.slice(0, 10)

    const getAlbumTypeIcon = (type: string) => {
        switch (type) {
            case 'album':
                return <Disc3 className="h-3 w-3" />
            case 'single':
                return <Music className="h-3 w-3" />
            default:
                return <Music className="h-3 w-3" />
        }
    }

    const getPopularityColor = (popularity: number) => {
        if (popularity >= 80) return 'bg-green-500'
        if (popularity >= 60) return 'bg-yellow-500'
        if (popularity >= 40) return 'bg-orange-500'
        return 'bg-red-500'
    }

    const isAlbumEntry = (track: Track) => track.id.includes('_album')

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Música & Discografia ({filteredAndSortedTracks.length} itens)
                </CardTitle>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar músicas ou álbuns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-48 justify-between">
                                {sortBy === 'popularity' && 'Popularidade'}
                                {sortBy === 'name' && 'Nome A-Z'}
                                {sortBy === 'release_date' && 'Data de Lançamento'}
                                {sortBy === 'duration' && 'Duração'}
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSortBy('popularity')}>
                                Popularidade
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('name')}>
                                Nome A-Z
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('release_date')}>
                                Data de Lançamento
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('duration')}>
                                Duração
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-3">
                    {displayedTracks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma música encontrada</p>
                        </div>
                    ) : (
                        <>
                            {displayedTracks.map((track, index) => {
                                const trackSpotifyId = extractSpotifyIdFromUri(track.uri)
                                const isAlbum = isAlbumEntry(track)
                                const spotifyUrl = isAlbum 
                                    ? `https://open.spotify.com/album/${track.album.id}`
                                    : `https://open.spotify.com/track/${trackSpotifyId}`
                                
                                return (
                                    <div
                                        key={`${track.id}-${index}`}
                                        className="group flex items-center justify-between rounded-lg p-4 transition-all hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* Track Number/Popularity Indicator */}
                                            <div className="flex flex-col items-center min-w-[40px]">
                                                <span className="text-sm font-medium text-gray-500">
                                                    #{index + 1}
                                                </span>
                                                {(track.popularity || 0) > 0 && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                                        <span className="text-xs text-gray-400">
                                                            {track.popularity}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Album Cover */}
                                            <div className="relative h-14 w-14 flex-shrink-0">
                                                <Image
                                                    src={track.album.images[0]?.url || '/placeholder-album.svg'}
                                                    alt={track.album.name}
                                                    fill
                                                    className="rounded-md object-cover"
                                                />
                                            </div>

                                            {/* Track Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {isAlbum ? (
                                                            <a
                                                                href={`/album/${track.album.id}`}
                                                                className="hover:underline"
                                                            >
                                                                {track.album.name}
                                                            </a>
                                                        ) : (
                                                            trackSpotifyId ? (
                                                                <a
                                                                    href={`/track/${trackSpotifyId}`}
                                                                    className="hover:underline"
                                                                >
                                                                    {track.name}
                                                                </a>
                                                            ) : (
                                                                track.name
                                                            )
                                                        )}
                                                    </h3>
                                                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                                        {getAlbumTypeIcon(track.album.album_type)}
                                                        {getAlbumTypeLabel(track.album.album_type)}
                                                    </Badge>
                                                </div>
                                                
                                                {!isAlbum && (
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {track.album.name}
                                                    </p>
                                                )}
                                                
                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatReleaseDate(track.album.release_date)}
                                                    </span>
                                                    {track.duration_ms > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDuration(track.duration_ms)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!isAlbum && (
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            )}
                                            
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 px-3"
                                                asChild
                                            >
                                                <a
                                                    href={spotifyUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    <span className="text-xs">Spotify</span>
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                            
                            {/* Show More/Less Button */}
                            {filteredAndSortedTracks.length > 10 && (
                                <div className="text-center pt-4">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowAll(!showAll)}
                                        className="w-full sm:w-auto"
                                    >
                                        {showAll 
                                            ? `Mostrar menos` 
                                            : `Mostrar mais ${filteredAndSortedTracks.length - 10} itens`
                                        }
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}