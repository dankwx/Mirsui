'use client'

import React, { useState } from 'react'
import { Badge } from '../ui/badge'
import {
    CircleIcon,
    ClockIcon,
    StarIcon,
    TrendingUpIcon,
    MoreVerticalIcon,
    HeartIcon,
    TrashIcon,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
// Importe os componentes de Tooltip
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../ui/tooltip' // Ajuste o caminho conforme necessário
import { removeTrack, toggleFavorite } from './actions' // Ajuste o caminho conforme necessário
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
    is_favorited: boolean // Favorito do DONO do perfil (público)
    is_user_favorited?: boolean // Favorito do usuário logado (para funcionalidade)
    favorite_count?: number
}

type SongsListProps = {
    songs: Song[]
    canRemove?: boolean // Para controlar se o usuário pode remover (ex: se é o próprio perfil)
}

const SongsList: React.FC<SongsListProps> = ({ songs, canRemove = false }) => {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
        {}
    )
    const [favoriteStates, setFavoriteStates] = useState<
        Record<string, boolean>
    >({})
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
        currentFavoriteState: boolean
    ) => {
        setFavoriteStates((prev) => ({ ...prev, [trackId]: true }))

        try {
            const result = await toggleFavorite(trackId, !currentFavoriteState)

            if (result.success) {
                console.log('Favorite toggled successfully')
                router.refresh() // Atualizar a página para refletir mudanças
            } else {
                alert(result.message || 'Erro ao alterar favorito')
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
            alert('Erro inesperado ao alterar favorito')
        } finally {
            setFavoriteStates((prev) => ({ ...prev, [trackId]: false }))
        }
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {songs.map((song) => (
                <Card key={song.id} className="group relative overflow-hidden">
                    <div className="relative aspect-square">
                        <img
                            src={song.track_thumbnail}
                            alt={song.track_title}
                            className="h-full w-full object-cover"
                            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                        />

                        {/* Indicador de favorito - visível para todos COM TOOLTIP */}
                        {song.is_favorited && (
                            <div className="absolute left-2 top-2 z-10">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge className="animate-pulse-once bg-red-500/90 text-white shadow-md">
                                                <HeartIcon className="mr-1 h-4 w-4 fill-current" />
                                                Favorite
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>This user loves this track!!</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}

                        {/* Menu dropdown - só aparece para o dono do perfil */}
                        {canRemove && (
                            <div className="absolute right-2 top-2 z-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full bg-white/80 text-gray-700 opacity-0 shadow-md transition-all duration-300 hover:bg-white hover:text-gray-900 group-hover:opacity-100"
                                        >
                                            <MoreVerticalIcon className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-48"
                                    >
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleToggleFavorite(
                                                    song.id,
                                                    song.is_favorited
                                                )
                                            }
                                            disabled={favoriteStates[song.id]}
                                            className="cursor-pointer"
                                        >
                                            <HeartIcon
                                                className={`mr-2 h-4 w-4 ${song.is_favorited ? 'fill-current text-red-500' : ''}`}
                                            />
                                            {favoriteStates[song.id] ? (
                                                <span className="flex items-center">
                                                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                                                    Processando...
                                                </span>
                                            ) : song.is_favorited ? (
                                                'Remover dos favoritos'
                                            ) : (
                                                'Adicionar aos favoritos'
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleRemoveTrack(
                                                    song.id,
                                                    song.track_title
                                                )
                                            }
                                            disabled={loadingStates[song.id]}
                                            className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                                        >
                                            <TrashIcon className="mr-2 h-4 w-4" />
                                            {loadingStates[song.id] ? (
                                                <span className="flex items-center">
                                                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                                    Removendo...
                                                </span>
                                            ) : (
                                                'Remover música'
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
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
