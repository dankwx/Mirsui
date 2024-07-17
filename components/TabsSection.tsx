import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CircleIcon, PlusIcon, SearchIcon, StarIcon } from 'lucide-react'
import ArtistsList from './ArtistsList'

const TabsSection: React.FC<{ artists: any[] }> = ({ artists }) => {
    return (
        <Tabs defaultValue="songs">
            <TabsList className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <TabsTrigger value="songs">Saved Songs</TabsTrigger>
                    <TabsTrigger value="youtube">Saved YouTube Channels</TabsTrigger>
                    <TabsTrigger value="artists">Saved Spotify Artists</TabsTrigger>
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
            <TabsContent value="songs">
                <div className="grid gap-6">
                    {/* Repeat this block for each song */}
                    <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                        <img src="/placeholder.jpeg" alt="Album Art" width={64} height={64} className="rounded-md" />
                        <div className="flex-1">
                            <div className="text-lg font-medium">Bohemian Rhapsody</div>
                            <div className="text-sm text-muted-foreground">Queen</div>
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
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="youtube">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                    {/* Repeat this block for each YouTube channel */}
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
                        <img src="/placeholder.svg" alt="Channel Thumbnail" width={128} height={72} className="rounded-md" />
                        <div className="text-center text-sm font-medium">Coding Tech</div>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="border-green-600 bg-background">
                                <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                Watched before it went viral
                            </Badge>
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="artists">
                <ArtistsList artists={artists} />
            </TabsContent>
        </Tabs>
    )
}

export default TabsSection
