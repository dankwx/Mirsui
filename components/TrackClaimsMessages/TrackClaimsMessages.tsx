// components/TrackClaimsMessages/TrackClaimsMessages.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Heart,
    MessageCircle,
    X,
    Send,
    Loader2,
    CheckCircle,
    Share2,
    ExternalLink,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/utils/supabase/client'

interface TrackClaimsMessagesProps {
    trackUri: string
    trackTitle: string
    artistName: string
    albumName: string
    popularity: number
    trackThumbnail: string
    youtubeUrl?: string | null
    trackUrl: string
    initialClaimed?: boolean
    userPosition?: number | null
}

export default function TrackClaimsMessages({
    trackUri,
    trackTitle,
    artistName,
    albumName,
    popularity,
    trackThumbnail,
    trackUrl,
    initialClaimed = false,
    userPosition = null,
    youtubeUrl: youtubeUrlProp = null,
}: TrackClaimsMessagesProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isClaimed, setIsClaimed] = useState(initialClaimed)
    const [claimPosition, setClaimPosition] = useState(userPosition)
    const [isExpanded, setIsExpanded] = useState(false)
    const [message, setMessage] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [youtubeUrl, setYoutubeUrl] = useState<string | null>(youtubeUrlProp) // New state for YouTube URL
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { toast } = useToast()
    const supabase = createClient()

    // Foca no textarea quando expandir
    useEffect(() => {
        if (isExpanded && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [isExpanded])

    // Função principal para reivindicar a música
    const handleClaim = async () => {
        if (isClaimed) return

        setIsLoading(true)

        try {
            // Verificar se o usuário está autenticado
            const { data: userData, error: authError } =
                await supabase.auth.getUser()

            if (authError || !userData.user) {
                toast({
                    title: 'Erro de autenticação',
                    description:
                        'Você precisa estar logado para reivindicar uma música.',
                    variant: 'destructive',
                })
                return
            }

            const userId = userData.user.id

            // Verificar se o usuário já reivindicou esta música (double-check no client)
            const { data: existingClaim, error: existingError } = await supabase
                .from('tracks')
                .select('id, position, youtube_url') // Select youtube_url
                .eq('user_id', userId)
                .eq('track_uri', trackUri)
                .single()

            if (existingError && existingError.code !== 'PGRST116') {
                throw existingError
            }

            if (existingClaim) {
                // Se já existe, apenas atualizar o estado local
                setIsClaimed(true)
                setClaimPosition(existingClaim.position)
                setYoutubeUrl(existingClaim.youtube_url) // Set existing YouTube URL
                toast({
                    title: 'Música já reivindicada',
                    description: `Você já reivindicou esta música na posição #${existingClaim.position}.`,
                    variant: 'destructive',
                })
                return
            }

            // Contar quantas vezes esta música foi reivindicada (para calcular a posição)
            const { count: trackCount, error: countError } = await supabase
                .from('tracks')
                .select('*', { count: 'exact' })
                .eq('track_uri', trackUri)

            if (countError) {
                throw countError
            }

            // A próxima posição será a contagem atual + 1
            const nextPosition = trackCount !== null ? trackCount + 1 : 1

            // Calcular discover_rating
            const discoverRating = 100 - popularity + 100 / nextPosition

            // Construir URL do Spotify se não fornecida
            const spotifyUrl =
                trackUrl ||
                `https://open.spotify.com/track/${trackUri.split(':')[2]}`

            // Fetch YouTube URL from API
            const youtubeResponse = await fetch('/api/get-youtube-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackTitle: trackTitle,
                    artistName: artistName,
                }),
            })

            let foundYoutubeUrl: string | null = null
            if (youtubeResponse.ok) {
                const youtubeData = await youtubeResponse.json()
                foundYoutubeUrl = youtubeData.youtubeUrl || null
                setYoutubeUrl(foundYoutubeUrl)
            } else {
                console.warn('Could not find YouTube URL for this track.')
            }

            // Preparar os dados para inserção
            const insertData = {
                track_url: spotifyUrl,
                track_uri: trackUri,
                track_title: trackTitle,
                artist_name: artistName,
                album_name: albumName,
                popularity: popularity,
                discover_rating: discoverRating,
                track_thumbnail: trackThumbnail,
                user_id: userId,
                position: nextPosition,
                claimedat: new Date().toISOString(),
                youtube_url: foundYoutubeUrl, // Add youtube_url to insert data
                ...(message.trim() && { claim_message: message.trim() }),
            }

            // Inserir no banco de dados
            const { error: insertError } = await supabase
                .from('tracks')
                .insert([insertData])

            if (insertError) {
                throw insertError
            }

            setIsClaimed(true)
            setClaimPosition(nextPosition)
            setShowSuccess(true)
            setIsExpanded(false)
            setMessage('')

            toast({
                title: 'Música reivindicada com sucesso!',
                description: `Você foi o #${nextPosition} a reivindicar "${trackTitle}".${foundYoutubeUrl ? ' Link do YouTube encontrado!' : ''}`,
            })

            // Remove o feedback de sucesso após 3 segundos
            setTimeout(() => {
                setShowSuccess(false)
            }, 3000)
        } catch (error) {
            console.error('Erro ao reivindicar música:', error)
            toast({
                title: 'Erro ao reivindicar música',
                description: 'Ocorreu um erro inesperado. Tente novamente.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Função para expandir a área de mensagem
    const handleExpand = () => {
        if (isClaimed) return
        setIsExpanded(true)
    }

    // Função para cancelar a adição da mensagem
    const handleCancel = () => {
        setIsExpanded(false)
        setMessage('')
    }

    // Função para reivindicar sem mensagem
    const handleQuickClaim = () => {
        if (isClaimed) return
        handleClaim()
    }

    const handleShare = async () => {
        const shareData = {
            title: `${trackTitle} - ${artistName}`,
            text: `Confira esta música que eu reivindiquei!`,
            url: trackUrl,
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
                toast({
                    title: 'Música compartilhada!',
                    description: 'O link foi compartilhado com sucesso.',
                })
            } else {
                await navigator.clipboard.writeText(trackUrl)
                toast({
                    title: 'Link copiado!',
                    description:
                        'O link foi copiado para sua área de transferência.',
                })
            }
        } catch (error) {
            console.error('Erro ao compartilhar:', error)
            toast({
                title: 'Erro ao compartilhar',
                description: 'Ocorreu um erro ao tentar compartilhar a música.',
                variant: 'destructive',
            })
        }
    }

    const openSpotify = () => {
        window.open(trackUrl, '_blank')
    }

    const openYouTube = () => {
        if (youtubeUrl) {
            window.open(youtubeUrl, '_blank')
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                {!isClaimed ? (
                    <>
                        <Button
                            onClick={handleQuickClaim}
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Heart className="mr-2 h-4 w-4" />
                            )}
                            {isLoading ? 'Reivindicando...' : 'Reivindicar'}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleExpand}
                            disabled={isLoading}
                            className="border-purple-200 hover:bg-purple-50"
                        >
                            <MessageCircle className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <Badge
                        variant="secondary"
                        className="flex flex-1 items-center justify-center gap-1 border-green-200 bg-green-100 px-3 py-2 text-base text-green-800"
                    >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Reivindicada
                        {claimPosition && ` • #${claimPosition}`}
                    </Badge>
                )}

                {isClaimed && (
                    <Button
                        onClick={handleShare}
                        size="lg"
                        variant="outline"
                        className="px-4"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900">
                                        Adicionar uma mensagem
                                    </h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancel}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <p className="text-sm text-gray-600">
                                    Compartilhe por que essa música é especial
                                    para você (opcional)
                                </p>

                                <Textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Ex: Essa música me lembra de momentos especiais..."
                                    className="min-h-[80px] resize-none border-purple-200 focus:border-purple-400"
                                    maxLength={280}
                                />

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {message.length}/280 caracteres
                                    </span>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancel}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={handleClaim}
                                            disabled={isLoading}
                                            size="sm"
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="mr-2 h-4 w-4" />
                                            )}
                                            {isLoading
                                                ? 'Enviando...'
                                                : 'Reivindicar'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {isClaimed && (
                <>
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="text-center text-sm font-medium text-green-600"
                            >
                                ✨ Música reivindicada com sucesso!
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="flex gap-2">
                        <Button
                            onClick={openSpotify}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                        >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Abrir no Spotify
                        </Button>

                        {youtubeUrl ? (
                            <Button
                                onClick={openYouTube}
                                variant="outline"
                                size="sm"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Abrir no YouTube
                            </Button>
                        ) : (
                            <p className="flex flex-1 items-center justify-center text-center text-xs text-gray-500">
                                URL do YouTube não encontrada.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
