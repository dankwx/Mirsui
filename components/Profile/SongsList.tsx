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
    ImageIcon,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
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
import { useCertificateGeneratorSimple } from '@/hooks/use-certificate-generator-simple'

type Song = {
    id: string
    track_url: string
    track_uri: string | null
    track_title: string
    artist_name: string
    album_name: string
    popularity: number
    discover_rating: number | null
    track_thumbnail: string | null
    claimedat: string | null
    is_favorited: boolean // Favorito do DONO do perfil (público)
    is_user_favorited?: boolean // Favorito do usuário logado (para funcionalidade)
    favorite_count?: number
}

type SongsListProps = {
    songs: Song[]
    canRemove?: boolean // Para controlar se o usuário pode remover (ex: se é o próprio perfil)
    userData?: {
        display_name: string
        username: string
        avatar_url?: string | null
    }
}

const SongsList: React.FC<SongsListProps> = ({ songs, canRemove = false, userData }) => {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
        {}
    )
    const [favoriteStates, setFavoriteStates] = useState<
        Record<string, boolean>
    >({})
    const router = useRouter()
    const { generateCertificate, isGenerating } = useCertificateGeneratorSimple()

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

    const handleGenerateCertificate = async (song: Song) => {
        if (!userData) {
            alert('Dados do usuário não disponíveis')
            return
        }

        const result = await generateCertificate(song, userData)
        
        if (result.success) {
            // Mostrar mensagem de sucesso
            alert(result.message || 'Certificado gerado com sucesso!')
        } else {
            alert(result.error || 'Erro ao gerar certificado')
        }
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {songs.map((song) => (
                <Card key={song.id} className="group relative overflow-hidden border-white/60 bg-white/50 backdrop-blur-xl hover:bg-white/70 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300">
                    <div className="relative aspect-square">
                        <img
                            src={song.track_thumbnail || '/placeholder-album.png'}
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
                                            <Badge className="animate-pulse-once bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50 backdrop-blur-md border-white/30">
                                                <HeartIcon className="mr-1 h-4 w-4 fill-current" />
                                                Favorite
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-white/90 backdrop-blur-xl border-white/60">
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
                                            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-xl text-gray-700 opacity-0 shadow-lg transition-all duration-300 hover:bg-white hover:text-gray-900 hover:scale-110 group-hover:opacity-100 border border-white/50"
                                        >
                                            <MoreVerticalIcon className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-48 bg-white/90 backdrop-blur-xl border-white/60"
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
                                        
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem
                                            onClick={() => handleGenerateCertificate(song)}
                                            disabled={isGenerating}
                                            className="cursor-pointer"
                                        >
                                            <ImageIcon className="mr-2 h-4 w-4" />
                                            {isGenerating ? (
                                                <span className="flex items-center">
                                                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                                                    Gerando discovery card...
                                                </span>
                                            ) : (
                                                'Gerar discovery card'
                                            )}
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
                                        
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

                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/80 via-purple-900/70 to-black/80 backdrop-blur-sm p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                            <div className="space-y-2 text-center text-white">
                                <div className="flex items-center justify-center gap-2">
                                    <ClockIcon className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                        Claimed on:{' '}
                                        {song.claimedat 
                                            ? new Date(song.claimedat).toLocaleDateString('pt-BR')
                                            : 'Unknown date'
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <TrendingUpIcon className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                        Discover Score: {song.discover_rating || 0}
                                    </span>
                                </div>
                                <div className="mt-2 text-xs opacity-90 bg-white/10 backdrop-blur-md rounded-full px-3 py-1">
                                    {song.popularity > 80
                                        ? '🔥 Hot track! Trending worldwide'
                                        : song.popularity > 50
                                          ? '🚀 Gaining momentum'
                                          : '🌱 Underground gem'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-4 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-sm">
                        <h3 className="truncate font-semibold text-slate-900">
                            {song.track_title}
                        </h3>
                        <p className="truncate text-sm text-slate-600">
                            {song.artist_name}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200/50 shadow-sm"
                            >
                                <CircleIcon className="mr-1 h-3 w-3 -translate-x-1 animate-pulse fill-green-400 text-green-400" />
                                Listened before it went viral
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200/50 shadow-sm"
                            >
                                <StarIcon className="mr-1 h-3 w-3 -translate-x-1 animate-pulse fill-orange-400 text-orange-400" />
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
