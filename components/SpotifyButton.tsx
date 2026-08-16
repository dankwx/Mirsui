'use client'

// Botão de "abrir lá fora". Chamava-se SpotifyButton e o rótulo era fixo em
// "Spotify" porque a página de artista era 100% Spotify. Ela passou a ser do
// Deezer (fase 3 do plano de independência), então o rótulo virou parâmetro em
// vez de mentira — o arquivo mantém o nome só para não mexer nos imports.

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import React from 'react'

interface ExternalLinkButtonProps {
    url: string
    label?: string
}

const ExternalLinkButton: React.FC<ExternalLinkButtonProps> = ({
    url,
    label = 'Ouvir lá fora',
}) => {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        >
            <ExternalLink className="mr-2 h-4 w-4" />
            {label}
        </Button>
    )
}

export default ExternalLinkButton
