import React from 'react'
import { fetchArtists } from '@/utils/fetchArtists'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { CircleIcon, StarIcon, TrendingUpIcon, ClockIcon } from 'lucide-react'

type Artist = {
    artist_id: string
    claim_date: string
    popularity_at_claim: number
    artists: {
        id: string
        artist_name: string
        artist_image_url: string
    }
}

type ArtistsListProps = {
    artists: Artist[]
}

const ArtistsList: React.FC<ArtistsListProps> = ({ artists }) => {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {artists.map((artist) => (
                <Card key={artist.artist_id} className="overflow-hidden">
                    <div className="relative aspect-square">
                        <img
                            src={artist.artists.artist_image_url}
                            alt={artist.artists.artist_name}
                            className="object-cover"
                            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 opacity-0 transition-opacity hover:opacity-100">
                            <div className="space-y-2 text-center text-white">
                                <div className="flex items-center justify-center gap-2">
                                    <ClockIcon className="h-5 w-5" />
                                    <span className="text-sm">
                                        Claimed on:{' '}
                                        {new Date(
                                            artist.claim_date
                                        ).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <TrendingUpIcon className="h-5 w-5" />
                                    <span className="text-sm">
                                        Popularity: {artist.popularity_at_claim}
                                        /100
                                    </span>
                                </div>
                                <div className="mt-2 text-xs opacity-75">
                                    {artist.popularity_at_claim > 80
                                        ? '🔥 Breaking Worldwide'
                                        : artist.popularity_at_claim > 50
                                          ? '🚀 Rising Star'
                                          : '🌱 Underground Talent'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <h3 className="truncate font-semibold">
                            {artist.artists.artist_name}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800"
                            >
                                <CircleIcon className="mr-1 h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                Listened before they went mainstream
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-800"
                            >
                                <StarIcon className="mr-1 h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                Rare find
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export async function getServerSideProps(context: {
    params: { userId: string }
}) {
    const { userId } = context.params
    const artists = await fetchArtists(userId)
    return { props: { artists } }
}

export default ArtistsList
