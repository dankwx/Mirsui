'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import React from 'react'

interface SpotifyButtonProps {
    artistUrl: string
}

const SpotifyButton: React.FC<SpotifyButtonProps> = ({ artistUrl }) => {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(artistUrl, '_blank')}
        >
            <ExternalLink className="mr-2 h-4 w-4" />
            Spotify
        </Button>
    )
}

export default SpotifyButton
