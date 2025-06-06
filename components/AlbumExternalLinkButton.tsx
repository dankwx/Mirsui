"use client"
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface AlbumExternalLinkButtonProps {
  url: string
  size?: 'sm' | 'lg'
  className?: string
}

export default function AlbumExternalLinkButton({ url, size = 'lg', className = '' }: AlbumExternalLinkButtonProps) {
  return (
    <Button
      size={size}
      className={className}
      onClick={() => window.open(url, '_blank')}
    >
      <ExternalLink className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
    </Button>
  )
}
