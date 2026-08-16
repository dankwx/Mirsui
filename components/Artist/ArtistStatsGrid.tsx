import { Card, CardContent } from '@/components/ui/card'

interface ArtistStatsGridProps {
    /** seguidores DENTRO do Mirsui */
    totalFollows: number
    /** `nb_fan` do Deezer, já formatado */
    fas: string | number
    /** 0-100: média da audiência das faixas mais tocadas (popScore do rank) */
    popularity: number | string
    totalAlbums: number
}

export default function ArtistStatsGrid({
    totalFollows,
    fas,
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
                        {fas}
                    </div>
                    <div className="text-sm text-gray-600">
                        Fãs no Deezer
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="mb-2 text-3xl font-bold text-orange-600">
                        {popularity}
                    </div>
                    {/* Era a "popularidade" do artista no Spotify. O Deezer
                        não tem esse número, e inventar um seria a mesma doença
                        dos "Nº 042" que saíram da /track. Este é medido: a
                        média da audiência das faixas mais tocadas dele, na
                        mesma escala 0-100 do Observatório. */}
                    <div className="text-sm text-gray-600">
                        Audiência média
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
