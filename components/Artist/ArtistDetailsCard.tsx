import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ArtistDetailsCardProps {
  genres: string[]
  popularity: number | string
  spotifyFollowers: string | number
  totalAlbums: number
  formatFollowers: (count: number) => string
}

export default function ArtistDetailsCard({
  genres,
  popularity,
  spotifyFollowers,
  totalAlbums,
  formatFollowers,
}: ArtistDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Artista</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Gêneros</span>
          <span className="text-right text-sm font-medium">{genres?.slice(0, 2).join(', ') || 'N/A'}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Popularidade</span>
          <span className="text-sm font-medium">{popularity || 'N/A'}/100</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Seguidores Spotify</span>
          <span className="text-sm font-medium">{spotifyFollowers}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total de Lançamentos</span>
          <span className="text-sm font-medium">{totalAlbums}</span>
        </div>
      </CardContent>
    </Card>
  )
}
