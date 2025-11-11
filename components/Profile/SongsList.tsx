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

    if (!songs.length) {
        return (
            <div className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] px-8 py-14 text-center text-white/55">
                <p className="text-sm uppercase tracking-[0.35em]">Nenhuma faixa salva ainda</p>
                <p className="mt-3 text-base text-white/45">
                    Capture descobertas para construir a sua galeria sonora.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {songs.map((song) => (
                <Card
                    key={song.id}
                    className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.05] shadow-[0_20px_50px_rgba(8,4,20,0.4)] transition hover:border-white/20 hover:bg-white/[0.08]"
                >
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
                                            <Badge className="animate-pulse-once border border-transparent bg-gradient-to-r from-rose-500/90 to-pink-500/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.35em] text-white shadow-[0_18px_45px_rgba(244,114,182,0.45)]">
                                                <HeartIcon className="mr-1 h-4 w-4 fill-current" />
                                                Favorite
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="border border-white/10 bg-[#05030f]/95 text-white shadow-[0_18px_45px_rgba(8,4,20,0.6)]">
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
                                            className="h-9 w-9 rounded-full border border-white/10 bg-[#05030f]/70 text-white opacity-0 transition hover:border-white/20 hover:bg-[#05030f]/90 group-hover:opacity-100"
                                        >
                                            <MoreVerticalIcon className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-52 border border-white/10 bg-[#05030f]/95 text-white shadow-[0_18px_45px_rgba(8,4,20,0.65)]"
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
                                                <span className="flex items-center text-white/70">
                                                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
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
                                                <span className="flex items-center text-white/70">
                                                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
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

                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#05030f]/90 via-purple-900/70 to-[#05030f]/90 p-5 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
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
                                <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.08] px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/75">
                                    {song.popularity > 80
                                        ? '🔥 Hot track!'
                                        : song.popularity > 50
                                          ? '🚀 Gaining momentum'
                                          : '🌱 Underground gem'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardContent className="space-y-3 bg-transparent p-6">
                        <h3 className="truncate text-lg font-semibold tracking-tight text-white">
                            {song.track_title}
                        </h3>
                        <p className="truncate text-sm text-white/60">
                            {song.artist_name}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.35em] text-white/60">
                            <Badge
                                variant="outline"
                                className="border border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                            >
                                <CircleIcon className="mr-1 h-3 w-3 -translate-x-1 animate-pulse fill-green-400 text-green-400" />
                                Listened before it went viral
                            </Badge>
                            <Badge
                                variant="outline"
                                className="border border-orange-400/40 bg-orange-500/10 text-orange-200"
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
