//components/ClaimButton/ClaimButton.tsx

'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Heart, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ClaimButtonProps {
    trackUri: string
    trackTitle: string
    artistName: string
    albumName: string
    popularity: number
    trackThumbnail: string
    trackUrl: string
    initialClaimed?: boolean
    userPosition?: number | null
}

export default function ClaimButton({
    trackUri,
    trackTitle,
    artistName,
    albumName,
    popularity,
    trackThumbnail,
    trackUrl,
    initialClaimed = false,
    userPosition = null,
}: ClaimButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isClaimed, setIsClaimed] = useState(initialClaimed)
    const [claimPosition, setClaimPosition] = useState(userPosition)
    const { toast } = useToast()
    const supabase = createClient()

    const handleClaimTrack = async () => {
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
                .select('id, position')
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

            // Inserir no banco de dados
            const { error: insertError } = await supabase
                .from('tracks')
                .insert([
                    {
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
                    },
                ])

            if (insertError) {
                throw insertError
            }

            setIsClaimed(true)
            setClaimPosition(nextPosition)
            toast({
                title: 'Música reivindicada com sucesso!',
                description: `Você foi o #${nextPosition} a reivindicar "${trackTitle}".`,
            })
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

    if (isClaimed) {
        return (
            <Button disabled className="flex-1" variant="outline">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                {claimPosition
                    ? `Reivindicada #${claimPosition}`
                    : 'Música Reivindicada'}
            </Button>
        )
    }

    return (
        <Button
            onClick={handleClaimTrack}
            disabled={isLoading}
            className="flex-1"
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reivindicando...
                </>
            ) : (
                <>
                    <Heart className="mr-2 h-4 w-4" />
                    Reivindicar Música
                </>
            )}
        </Button>
    )
}
