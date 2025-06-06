import { Card, CardContent } from '@/components/ui/card'

interface ArtistStatsGridProps {
    totalFollows: number
    spotifyFollowers: string | number
    popularity: number | string
    totalAlbums: number
}

export default function ArtistStatsGrid({
    totalFollows,
    spotifyFollowers,
    popularity,
    totalAlbums,
}: ArtistStatsGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="mb-2 text-3xl font-bold text-purple-600">
                        {totalFollows}
                    </div>
                    <div className="text-sm text-gray-600">
                        Seguidores na Plataforma
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="mb-2 text-3xl font-bold text-green-600">
                        {spotifyFollowers}
                    </div>
                    <div className="text-sm text-gray-600">
                        Seguidores Spotify
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="mb-2 text-3xl font-bold text-orange-600">
                        {popularity}
                    </div>
                    <div className="text-sm text-gray-600">
                        Popularidade Global
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="mb-2 text-3xl font-bold text-blue-600">
                        {totalAlbums}
                    </div>
                    <div className="text-sm text-gray-600">Lançamentos</div>
                </CardContent>
            </Card>
        </div>
    )
}
