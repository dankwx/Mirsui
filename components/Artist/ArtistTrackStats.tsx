'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDuration } from '@/lib/formatters'
import { 
    TrendingUp, 
    Clock, 
    Disc, 
    Calendar,
    BarChart3,
    Star
} from 'lucide-react'

interface TrackStatsProps {
    topTracks: any[]
    albums: any[]
}

export default function ArtistTrackStats({
    topTracks,
    albums,
}: TrackStatsProps) {
    // Calculate statistics
    const totalAlbums = albums.length
    const totalSingles = albums.filter(album => album.album_type === 'single').length
    const totalFullAlbums = albums.filter(album => album.album_type === 'album').length
    const totalCompilations = albums.filter(album => album.album_type === 'compilation').length
    
    const averagePopularity = topTracks.length > 0 
        ? Math.round(topTracks.reduce((sum, track) => sum + track.popularity, 0) / topTracks.length)
        : 0
    
    const totalDuration = topTracks.reduce((sum, track) => sum + track.duration_ms, 0)
    const averageDuration = topTracks.length > 0 ? totalDuration / topTracks.length : 0
    
    const mostPopularTrack = topTracks.length > 0 
        ? topTracks.reduce((prev, current) => (prev.popularity > current.popularity) ? prev : current)
        : null
    
    const longestTrack = topTracks.length > 0 
        ? topTracks.reduce((prev, current) => (prev.duration_ms > current.duration_ms) ? prev : current)
        : null
    
    // Get latest releases
    const latestAlbums = albums
        .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
        .slice(0, 3)
    
    const getPopularityLabel = (popularity: number) => {
        if (popularity >= 80) return { label: 'Muito Popular', color: 'bg-green-500' }
        if (popularity >= 60) return { label: 'Popular', color: 'bg-yellow-500' }
        if (popularity >= 40) return { label: 'Moderado', color: 'bg-orange-500' }
        return { label: 'Baixa Popularidade', color: 'bg-red-500' }
    }

    const getAlbumTypeIcon = (type: string) => {
        switch (type) {
            case 'album':
                return <Disc className="h-4 w-4" />
            case 'single':
                return <Disc className="h-4 w-4" />
            default:
                return <Disc className="h-4 w-4" />
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Music Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Estatísticas da Música
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Discography Overview */}
                    <div>
                        <h4 className="font-medium mb-3">Discografia</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{totalFullAlbums}</div>
                                <div className="text-sm text-gray-600">Álbuns</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{totalSingles}</div>
                                <div className="text-sm text-gray-600">Singles</div>
                            </div>
                        </div>
                        {totalCompilations > 0 && (
                            <div className="text-center p-3 bg-gray-50 rounded-lg mt-2">
                                <div className="text-2xl font-bold text-purple-600">{totalCompilations}</div>
                                <div className="text-sm text-gray-600">Coletâneas</div>
                            </div>
                        )}
                    </div>

                    {/* Popularity Stats */}
                    {averagePopularity > 0 && (
                        <div>
                            <h4 className="font-medium mb-3">Popularidade Média</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        {getPopularityLabel(averagePopularity).label}
                                    </span>
                                    <span className="font-medium">{averagePopularity}/100</span>
                                </div>
                                <Progress value={averagePopularity} className="h-2" />
                            </div>
                        </div>
                    )}

                    {/* Duration Stats */}
                    {averageDuration > 0 && (
                        <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Duração Média
                            </h4>
                            <div className="text-lg font-semibold">
                                {formatDuration(averageDuration)}
                            </div>
                            <div className="text-sm text-gray-600">
                                Total: {formatDuration(totalDuration)}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Highlights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Destaques
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Most Popular Track */}
                    {mostPopularTrack && (
                        <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                Música Mais Popular
                            </h4>
                            <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                                <div className="font-semibold">{mostPopularTrack.name}</div>
                                <div className="text-sm text-gray-600">{mostPopularTrack.album.name}</div>
                                <Badge variant="secondary" className="mt-1">
                                    {mostPopularTrack.popularity}/100 popularidade
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Longest Track */}
                    {longestTrack && (
                        <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                Música Mais Longa
                            </h4>
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                                <div className="font-semibold">{longestTrack.name}</div>
                                <div className="text-sm text-gray-600">{longestTrack.album.name}</div>
                                <Badge variant="secondary" className="mt-1">
                                    {formatDuration(longestTrack.duration_ms)}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Latest Releases */}
                    <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-500" />
                            Lançamentos Recentes
                        </h4>
                        <div className="space-y-2">
                            {latestAlbums.map((album, index) => (
                                <div key={album.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                        {getAlbumTypeIcon(album.album_type)}
                                        <span className="font-medium text-sm truncate">
                                            {album.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(album.release_date).getFullYear()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}