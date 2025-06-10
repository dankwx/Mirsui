// components/TrackPreview/TrackPreview.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    ExternalLink,
    Music,
    Youtube,
    AlertCircle,
} from 'lucide-react'

interface TrackPreviewProps {
    trackId: string
    className?: string
}

interface TrackPreviewData {
    trackName: string
    artistName: string
    albumName: string
    youtubeUrl: string
    spotifyUrl: string
    thumbnailUrl: string
    duration: string
    popularity: number
}

export default function TrackPreview({
    trackId,
    className = '',
}: TrackPreviewProps) {
    const [previewData, setPreviewData] = useState<TrackPreviewData | null>(
        null
    )
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)

    // Função para buscar dados do preview
    const fetchPreviewData = async () => {
        if (!trackId) return

        setLoading(true)
        setError(null)

        try {
            console.log(
                `[TrackPreview] Buscando dados para track ID: ${trackId}`
            )

            // Primeiro, busca informações do Spotify
            const spotifyResponse = await fetch(`/api/spotify/track/${trackId}`)

            if (!spotifyResponse.ok) {
                throw new Error(
                    `Erro ao buscar dados do Spotify: ${spotifyResponse.status}`
                )
            }

            const spotifyData = await spotifyResponse.json()

            if (!spotifyData) {
                throw new Error('Dados do Spotify não encontrados')
            }

            console.log('[TrackPreview] Dados do Spotify obtidos:', spotifyData)

            // Busca vídeo do YouTube
            const youtubeResponse = await fetch('/api/youtube/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackName: spotifyData.name,
                    artistName:
                        spotifyData.artists[0]?.name || 'Unknown Artist',
                }),
            })

            let youtubeUrl = null
            if (youtubeResponse.ok) {
                const youtubeData = await youtubeResponse.json()
                youtubeUrl = youtubeData.url
            }

            console.log('[TrackPreview] URL do YouTube obtida:', youtubeUrl)

            // Formatar duração
            const formatDuration = (ms: number) => {
                const minutes = Math.floor(ms / 60000)
                const seconds = Math.floor((ms % 60000) / 1000)
                return `${minutes}:${seconds.toString().padStart(2, '0')}`
            }

            // Montar dados do preview
            const preview: TrackPreviewData = {
                trackName: spotifyData.name,
                artistName: spotifyData.artists
                    .map((artist: any) => artist.name)
                    .join(', '),
                albumName: spotifyData.album.name,
                youtubeUrl: youtubeUrl || '',
                spotifyUrl: `https://open.spotify.com/track/${trackId}`,
                thumbnailUrl:
                    spotifyData.album.images[0]?.url || '/placeholder.svg',
                duration: formatDuration(spotifyData.duration_ms),
                popularity: spotifyData.popularity,
            }

            setPreviewData(preview)
            console.log('[TrackPreview] Preview data montado:', preview)
        } catch (err) {
            console.error('[TrackPreview] Erro ao buscar dados:', err)
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    // Effect para buscar dados quando o componente monta ou trackId muda
    useEffect(() => {
        fetchPreviewData()
    }, [trackId])

    // Função para extrair video ID do YouTube
    const getYouTubeVideoId = (url: string): string | null => {
        const match = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
        )
        return match ? match[1] : null
    }

    // Loading state
    if (loading) {
        return (
            <Card className={`overflow-hidden ${className}`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Music className="h-5 w-5" />
                        Preview da Música
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="aspect-video w-full" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Error state
    if (error) {
        return (
            <Card className={`overflow-hidden ${className}`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Erro no Preview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-sm text-gray-600">{error}</p>
                    <Button onClick={fetchPreviewData} variant="outline">
                        Tentar Novamente
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Success state
    if (!previewData) {
        return null
    }

    const youtubeVideoId = previewData.youtubeUrl
        ? getYouTubeVideoId(previewData.youtubeUrl)
        : null

    return (
        <Card className={`overflow-hidden ${className}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Preview da Música
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Track Info */}

                {/* YouTube Player */}
                {youtubeVideoId ? (
                    <div className="space-y-3">
                        <div className="aspect-video w-full overflow-hidden rounded-lg">
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&mute=${isMuted ? 1 : 0}`}
                                title={`${previewData.trackName} - ${previewData.artistName}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="h-full w-full"
                            />
                        </div>

                        {/* Player Controls */}
                    </div>
                ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gray-100">
                        <div className="text-center text-gray-500">
                            <Youtube className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p className="text-sm">
                                Vídeo do YouTube não disponível
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button asChild className="flex-1">
                        <a
                            href={previewData.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Music className="mr-2 h-4 w-4" />
                            Abrir no Spotify
                        </a>
                    </Button>

                    {previewData.youtubeUrl && (
                        <Button asChild variant="outline" className="flex-1">
                            <a
                                href={previewData.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Youtube className="mr-2 h-4 w-4" />
                                Ver no YouTube
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
