import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Music, Play } from 'lucide-react'
import { extractSpotifyIdFromUri } from '@/lib/spotifyUri'
import { formatDuration, formatReleaseDate } from '@/lib/formatters'

interface ArtistTopTracksProps {
    topTracks: any[]
}

export default function ArtistTopTracks({
    topTracks,
}: ArtistTopTracksProps) {
    if (!topTracks.length) return null

    // No need for spotifyUri and spotifyId here, as we'll extract for each track

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Músicas Mais Populares
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {topTracks.slice(0, 5).map((track, index) => {
                    // Extract spotifyId for the current track
                    const trackSpotifyId = extractSpotifyIdFromUri(track.uri)

                    return (
                        <div
                            key={track.id}
                            className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-4">
                                <span className="w-6 text-sm font-medium text-gray-500">
                                    {index + 1}
                                </span>
                                <div className="relative h-12 w-12">
                                    <Image
                                        src={
                                            track.album.images[0]?.url ||
                                            '/placeholder-album.svg'
                                        }
                                        alt={track.album.name}
                                        fill
                                        className="rounded object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {/* Use trackSpotifyId and correct Spotify URL */}
                                        {trackSpotifyId ? (
                                            <a
                                                href={`/track/${trackSpotifyId}`}
                                                rel="noopener noreferrer"
                                                className="hover:underline"
                                            >
                                                {track.name}
                                            </a>
                                        ) : (
                                            track.name
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {track.album.name} •{' '}
                                        {formatReleaseDate(
                                            track.album.release_date
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">
                                    {formatDuration(track.duration_ms)}
                                </span>
                                <Button variant="ghost" size="sm">
                                    <Play className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
