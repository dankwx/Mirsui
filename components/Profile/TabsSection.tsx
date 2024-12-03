import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CircleIcon, PlusIcon, SearchIcon, StarIcon } from 'lucide-react'
import ArtistsList from './ArtistsList'
import SongsList from './SongsList'
import ChannelsList from './ChannelsList'

const TabsSection: React.FC<{
    artists: any[]
    songs: any[]
    channels: any[]
}> = ({ artists, songs, channels }) => {
    return (
        <Tabs defaultValue="songs" className="min-w-full max-w-full flex-1">
            <TabsList className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <TabsTrigger value="songs">Saved Songs</TabsTrigger>
                    <TabsTrigger value="youtube">
                        Saved YouTube Channels
                    </TabsTrigger>
                    <TabsTrigger value="artists">
                        Saved Spotify Artists
                    </TabsTrigger>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                        <SearchIcon className="h-4 w-4" />
                        <span>Search</span>
                    </Button>
                    <Button variant="outline" size="sm">
                        <PlusIcon className="h-4 w-4" />
                        <span>Add</span>
                    </Button>
                </div>
            </TabsList>
            <TabsContent value="songs" className="w-full">
                <SongsList songs={songs} />
            </TabsContent>
            <TabsContent value="youtube">
                <ChannelsList channels={channels} />
            </TabsContent>
            <TabsContent value="artists">
                <ArtistsList artists={artists} />
            </TabsContent>
        </Tabs>
    )
}

export default TabsSection
