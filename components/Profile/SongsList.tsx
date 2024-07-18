import React from 'react'
import { fetchSongs } from '@/utils/fetchSongs'
import { Badge } from '../ui/badge'
import { CircleIcon, StarIcon } from 'lucide-react'
import { Button } from '../ui/button'

type Song = {
    id: string
    track_url: string
    track_title: string
    artist_name: string
    album_name: string
    popularity: number
    track_thumbnail: string
    claimedat: string
}

type SongsListProps = {
    songs: Song[]
}

const SongsList: React.FC<SongsListProps> = ({ songs }) => {
    return (
        <div className="grid gap-6">
            {songs.map((song) => (
                <div key={song.id} className="flex items-center gap-4 bg-muted p-4 rounded-lg">
                    <img
                        src={song.track_thumbnail}
                        alt={song.track_title}
                        width={64} height={64} className="rounded-md"
                    />
                    <div className="flex-1">
                        <div className="text-lg font-medium">{song.track_title}</div>
                        <div className="text-sm text-muted-foreground">{song.artist_name}</div>
                        <div className="flex items-center gap-2 mt-2">
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
                        {/* <p>
                            Claimed on: {new Date(song.claimedat).toLocaleDateString()}
                        </p>
                        <p>Popularity at claim: {song.popularity}</p> */}
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
    const songs = await fetchSongs(userId)
    return { props: { songs } }
}

export default SongsList
