//components/ClaimButton/ClaimButton.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { trackClaimTrack, event } from '@/lib/gtag'

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

    const handleClaimTrack = async () => {
        setIsLoading(true)

        try {
            // Construir URL do Spotify se não fornecida
            const spotifyUrl =
                trackUrl ||
                `https://open.spotify.com/track/${trackUri.split(':')[2]}`

            // Chamar API route que vai chamar o backend
            const response = await fetch('/api/claim-track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackUri,
                    trackName: trackTitle,
                    artistName,
                    albumName,
                    spotifyUrl,
                    trackThumbnail,
                    popularity,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                // Se erro 401 (não autenticado)
                if (response.status === 401) {
                    event({
                        action: 'claim_attempt_unauthenticated',
                        category: 'engagement',
                        label: `${artistName} - ${trackTitle}`
                    })
                    
                    toast({
                        title: 'Erro de autenticação',
                        description: data.error || 'Você precisa estar logado para reivindicar uma música.',
                        variant: 'destructive',
                    })
                    return
                }

                // Se erro 409 (já reivindicado)
                if (response.status === 409) {
                    setIsClaimed(true)
                    setClaimPosition(data.position)
                    toast({
                        title: 'Música já reivindicada',
                        description: `Você já reivindicou esta música na posição #${data.position}.`,
                        variant: 'destructive',
                    })
                    return
                }

                throw new Error(data.error || 'Erro ao reivindicar música')
            }

            // Sucesso!
            const nextPosition = data.position

            // Rastrear o claim no Google Analytics
            trackClaimTrack(trackTitle, artistName)
            
            // Rastrear evento adicional com posição e popularidade
            event({
                action: 'claim_success',
                category: 'engagement',
                label: `${artistName} - ${trackTitle}`,
                value: nextPosition
            })

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
                description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.',
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
