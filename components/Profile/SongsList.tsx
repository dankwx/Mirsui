'use client'

import React, { useState } from 'react'
import { Badge } from '../ui/badge'
import {
    CircleIcon,
    ClockIcon,
    StarIcon,
    TrendingUpIcon,
    XIcon,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { removeTrack } from './actions' // Ajuste o caminho conforme necessário
import { useRouter } from 'next/navigation'

type Song = {
    id: string
    track_url: string
    track_uri: string
    track_title: string
    artist_name: string
    album_name: string
    popularity: number
    discover_rating: number
    track_thumbnail: string
    claimedat: string
}

type SongsListProps = {
    songs: Song[]
    canRemove?: boolean // Para controlar se o usuário pode remover (ex: se é o próprio perfil)
}

const SongsList: React.FC<SongsListProps> = ({ songs, canRemove = false }) => {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
        {}
    )
    const router = useRouter()

    const handleRemoveTrack = async (trackId: string, trackTitle: string) => {
        // Confirmar antes de remover
        if (!confirm(`Tem certeza que deseja remover "${trackTitle}"?`)) {
            return
        }

        setLoadingStates((prev) => ({ ...prev, [trackId]: true }))

        try {
            const result = await removeTrack(trackId)

            if (result.success) {
                // Opcional: mostrar toast de sucesso
                console.log('Track removed successfully')
                router.refresh() // Atualizar a página
            } else {
                alert(result.message || 'Erro ao remover a música')
            }
        } catch (error) {
            console.error('Error removing track:', error)
            alert('Erro inesperado ao remover a música')
        } finally {
            setLoadingStates((prev) => ({ ...prev, [trackId]: false }))
        }
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {songs.map((song) => (
                <Card key={song.id} className="group overflow-hidden">
                    <div className="relative aspect-square">
                        <img
                            src={song.track_thumbnail}
                            alt={song.track_title}
                            className="object-cover"
                            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                        />

                        {/* Botão de remoção */}
                        {canRemove && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white/80 text-red-600 opacity-0 shadow-md transition-all duration-300 hover:bg-white hover:text-red-700 group-hover:opacity-100"
                                onClick={() =>
                                    handleRemoveTrack(song.id, song.track_title)
                                }
                                disabled={loadingStates[song.id]}
                            >
                                {loadingStates[song.id] ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                ) : (
                                    <XIcon className="h-4 w-4" />
                                )}
                            </Button>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 opacity-0 transition-opacity hover:opacity-100">
                            <div className="space-y-2 text-center text-white">
                                <div className="flex items-center justify-center gap-2">
                                    <ClockIcon className="h-5 w-5" />
                                    <span className="text-sm">
                                        Claimed on:{' '}
                                        {new Date(
                                            song.claimedat
                                        ).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <TrendingUpIcon className="h-5 w-5" />
                                    <span className="text-sm">
                                        Discover Score: {song.discover_rating}
                                    </span>
                                </div>
                                <div className="mt-2 text-xs opacity-75">
                                    {song.popularity > 80
                                        ? '🔥 Hot track! Trending worldwide'
                                        : song.popularity > 50
                                          ? '🚀 Gaining momentum'
                                          : '🌱 Underground gem'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <h3 className="truncate font-semibold">
                            {song.track_title}
                        </h3>
                        <p className="truncate text-sm text-muted-foreground">
                            {song.artist_name}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800"
                            >
                                <CircleIcon className="mr-1 h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                Listened before it went viral
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-800"
                            >
                                <StarIcon className="mr-1 h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                Rare find
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default SongsList
