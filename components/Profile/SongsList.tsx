'use client'

import React, { useState } from 'react'
import { Badge } from '../ui/badge'
import {
    CircleIcon,
    ClockIcon,
    StarIcon,
    TrendingUpIcon,
    XIcon,
    HeartIcon,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { removeTrack, toggleFavorite } from './actions'
import { useRouter } from 'next/navigation'
import type { Song } from '@/types/profile'

type SongsListProps = {
    songs: Song[]
    canRemove?: boolean // Para controlar se o usuário pode remover (ex: se é o próprio perfil)
    currentUserId?: string // ID do usuário logado para controlar favoritos
}

const SongsList: React.FC<SongsListProps> = ({
    songs,
    canRemove = false,
    currentUserId,
}) => {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
        {}
    )
    const [favoriteLoadingStates, setFavoriteLoadingStates] = useState<
        Record<string, boolean>
    >({})
    const [favoriteStates, setFavoriteStates] = useState<
        Record<string, boolean>
    >(
        // Inicializar com o estado atual dos favoritos
        songs.reduce(
            (acc, song) => {
                acc[song.id] = song.is_favorited || false
                return acc
            },
            {} as Record<string, boolean>
        )
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

    const handleToggleFavorite = async (
        trackId: string,
        trackTitle: string
    ) => {
        if (currentUserId) {
            alert('Você precisa estar logado para favoritar músicas')
            return
        }

        setFavoriteLoadingStates((prev) => ({ ...prev, [trackId]: true }))

        try {
            const result = await toggleFavorite(trackId)

            if (result.success) {
                // Atualizar o estado local imediatamente para uma melhor UX
                setFavoriteStates((prev) => ({
                    ...prev,
                    [trackId]: result.isFavorited,
                }))

                // Opcional: mostrar feedback
                console.log(result.message)

                // Refresh para atualizar contadores, etc.
                router.refresh()
            } else {
                alert(result.message || 'Erro ao favoritar a música')
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
            alert('Erro inesperado ao favoritar a música')
        } finally {
            setFavoriteLoadingStates((prev) => ({ ...prev, [trackId]: false }))
        }
    }

    const isLoggedIn = !!currentUserId

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {songs.map((song) => {
                const isFavorited = favoriteStates[song.id]
                const isLoadingFavorite = favoriteLoadingStates[song.id]
                const isLoadingRemove = loadingStates[song.id]

                return (
                    <Card key={song.id} className="group overflow-hidden">
                        <div className="relative aspect-square">
                            <img
                                src={song.track_thumbnail}
                                alt={song.track_title}
                                className="object-cover"
                                style={{
                                    aspectRatio: '1/1',
                                    objectFit: 'cover',
                                }}
                            />

                            {/* Botões no canto superior */}
                            <div className="absolute right-2 top-2 z-10 flex gap-2">
                                {/* Botão de favorito */}
                                {canRemove && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 rounded-full shadow-md transition-all duration-300 ${
                                            isFavorited
                                                ? 'bg-red-500/90 text-white opacity-100 hover:bg-red-600'
                                                : 'bg-white/80 text-red-600 opacity-0 hover:bg-white hover:text-red-700 group-hover:opacity-100'
                                        }`}
                                        onClick={() =>
                                            handleToggleFavorite(
                                                song.id,
                                                song.track_title
                                            )
                                        }
                                        disabled={isLoadingFavorite}
                                        title={
                                            isFavorited
                                                ? 'Remover dos favoritos'
                                                : 'Adicionar aos favoritos'
                                        }
                                    >
                                        {isLoadingFavorite ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        ) : (
                                            <HeartIcon
                                                className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`}
                                            />
                                        )}
                                    </Button>
                                )}

                                {/* Botão de remoção */}
                                {canRemove && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-white/80 text-red-600 opacity-0 shadow-md transition-all duration-300 hover:bg-white hover:text-red-700 group-hover:opacity-100"
                                        onClick={() =>
                                            handleRemoveTrack(
                                                song.id,
                                                song.track_title
                                            )
                                        }
                                        disabled={isLoadingRemove}
                                        title="Remover música"
                                    >
                                        {isLoadingRemove ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                        ) : (
                                            <XIcon className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                            </div>

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
                                            Discover Score:{' '}
                                            {song.discover_rating}
                                        </span>
                                    </div>
                                    {/* Mostrar contagem de favoritos se maior que 0 */}
                                    {song.favorite_count &&
                                        song.favorite_count > 0 && (
                                            <div className="flex items-center justify-center gap-2">
                                                <HeartIcon className="h-5 w-5 fill-red-500 text-red-500" />
                                                <span className="text-sm">
                                                    {song.favorite_count}{' '}
                                                    {song.favorite_count === 1
                                                        ? 'pessoa curtiu'
                                                        : 'pessoas curtiram'}
                                                </span>
                                            </div>
                                        )}
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
                                {/* Badge de favorito para músicas favoritadas */}
                                {isFavorited && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-red-100 text-red-800"
                                    >
                                        <HeartIcon className="mr-1 h-3 w-3 -translate-x-1 fill-red-300 text-red-300" />
                                        Favorited
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default SongsList
