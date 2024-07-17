import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CircleIcon, StarIcon } from 'lucide-react'

interface Song {
    id: string
    track_url: string
    track_title: string
    artist_name: string
    album_name: string
    popularity: number
    track_thumbnail: string
    claimedat: string
}

interface SavedSongsProps {
    songs: Song[]
}

const SavedSongs: React.FC<SavedSongsProps> = ({ songs }) => {
    if (!songs || songs.length === 0) {
        return <div>No saved songs found.</div>;
    }

    return (
        <div className="grid gap-6">
            {songs.map((song) => (
                <div key={song.id} className="flex items-center gap-4 rounded-lg bg-muted p-4">
                    {song.track_thumbnail && (
                        <img src={song.track_thumbnail} alt={song.track_title} width={64} height={64} className="rounded-md" />
                    )}
                    <div className="flex-1">
                        <div className="text-lg font-medium">{song.track_title}</div>
                        <div className="text-sm text-muted-foreground">{song.artist_name}</div>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="border-green-600 bg-background">
                                <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                Listened before it went viral
                            </Badge>
                            <Badge variant="outline" className="border-orange-600 bg-background">
                                <StarIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                Rare find
                            </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                            View Album
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SavedSongs;
