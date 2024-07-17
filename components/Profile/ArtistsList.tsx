// File: ArtistsList.tsx
import React from 'react'
import { fetchArtists } from '@/utils/fetchArtists'
import { Badge } from '../ui/badge'
import { CircleIcon, StarIcon } from 'lucide-react'
import { Button } from '../ui/button'

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
        <div className="grid gap-6">
            {artists.map((artist) => (
                <div key={artist.artist_id} className="flex items-center gap-4 bg-muted p-4 rounded-lg">
                    <img
                        src={artist.artists.artist_image_url}
                        alt={artist.artists.artist_name}
                        width={64} height={64} className="rounded-full"
                    />
                    <div className="flex-1">
                        <div className="text-lg font-medium">{artist.artists.artist_name}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="border-green-600 bg-background">
                                <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                Listened before they went mainstream
                            </Badge>
                            <Badge variant="outline" className="border-orange-600 bg-background">
                                <StarIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                Rare find
                            </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                            View Discography
                        </Button>
                        <p>
                            Claimed on: {new Date(artist.claim_date).toLocaleDateString()}
                        </p>
                        <p>Popularity at claim: {artist.popularity_at_claim}</p>
                    </div>
                </div>
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