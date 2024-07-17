import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CircleIcon, StarIcon } from 'lucide-react'

interface Artist {
    id: string
    artist_name: string
    artist_image_url: string
    popularity_at_claim: number
    claim_date: string
}

interface SavedArtistsProps {
    artists: Artist[]
}

const SavedArtists: React.FC<SavedArtistsProps> = ({ artists }) => {
    console.log('Artists in SavedArtists component:', artists);
    if (!artists || artists.length === 0) {
        return <div>No saved artists found.</div>;
    }

    return (
        <div className="grid gap-6">
            {artists.map((artist) => (
                <div key={artist.id} className="flex items-center gap-4 rounded-lg bg-muted p-4">
                    {artist.artist_image_url && (
                        <img src={artist.artist_image_url} alt={artist.artist_name} width={64} height={64} className="rounded-full" />
                    )}
                    <div className="flex-1">
                        <div className="text-lg font-medium">{artist.artist_name}</div>
                        <div className="mt-2 flex items-center gap-2">
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
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SavedArtists;