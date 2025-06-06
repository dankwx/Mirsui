import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mic, Play, Share2, UserPlus } from 'lucide-react'
import SpotifyButton from '@/components/SpotifyButton'

interface ArtistHeroSectionProps {
    artistInfo: any
    artistImageUrl: string
    artistUrl: string
    hasUserFollowed: boolean
}

export default function ArtistHeroSection({
    artistInfo,
    artistImageUrl,
    artistUrl,
    hasUserFollowed,
}: ArtistHeroSectionProps) {
    return (
        <div className="flex flex-col md:flex-row">
            <div className="relative h-80 w-full md:w-80">
                <Image
                    src={artistImageUrl}
                    alt={`Foto do artista ${artistInfo?.name || 'Artista'}`}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                    <Button size="lg" className="h-16 w-16 rounded-full">
                        <Play className="h-6 w-6" />
                    </Button>
                </div>
            </div>
            <div className="flex-1 space-y-4 p-6">
                <div>
                    <Badge variant="secondary" className="mb-2">
                        <Mic className="mr-1 h-3 w-3" />
                        Artista Verificado
                    </Badge>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        {artistInfo?.name || 'Artista Desconhecido'}
                    </h1>
                    <div className="mb-4 flex flex-wrap gap-2">
                        {artistInfo?.genres
                            ?.slice(0, 3)
                            .map((genre: string, index: number) => (
                                <Badge key={index} variant="outline">
                                    {genre}
                                </Badge>
                            ))}
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <UserPlus className="h-4 w-4" />
                        {/* Followers count handled in stats grid */}
                    </div>
                </div>
                <div className="flex gap-3 pt-4">
                    <Button className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        {hasUserFollowed ? 'Seguindo' : 'Seguir Artista'}
                    </Button>
                    <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <SpotifyButton artistUrl={artistUrl} />
                </div>
            </div>
        </div>
    )
}
