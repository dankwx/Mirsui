'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    Music, 
    Play, 
    Plus, 
    Search,
    MoreVertical,
    ExternalLink,
    Calendar,
    Users,
    Lock,
    Globe,
    Clock
} from 'lucide-react'

interface PlaylistTrack {
    id: string
    track_title: string
    artist_name: string
    album_name: string
    track_thumbnail: string
    track_url: string
    popularity: number
    discover_rating: number
    duration: string
}

interface Playlist {
    id: string
    name: string
    description: string
    track_count: number
    thumbnail: string
    created_at: string
    is_public: boolean
    tracks: PlaylistTrack[]
}

interface LibraryTabsProps {
    playlists: Playlist[]
}

const LibraryTabs: React.FC<LibraryTabsProps> = ({ playlists }) => {
    const [activeTab, setActiveTab] = useState('playlists')
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
                <TabsTrigger value="playlists">My Playlists</TabsTrigger>
                <TabsTrigger value="details">Playlist Details</TabsTrigger>
            </TabsList>

            {/* Playlists Tab */}
            <TabsContent value="playlists" className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">My Playlists</h3>
                        <p className="text-muted-foreground">Organize your musical discoveries</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            {playlists.length} playlists
                        </Badge>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Playlist
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {playlists.map((playlist) => (
                        <Card key={playlist.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                              onClick={() => {
                                  setSelectedPlaylist(playlist)
                                  setActiveTab('details')
                              }}>
                            <CardContent className="p-0">
                                <div className="relative aspect-square bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-t-lg flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <Music className="h-16 w-16 text-white opacity-90 z-10" />
                                    
                                    {/* Play button overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                        <Button size="icon" className="h-12 w-12 rounded-full bg-white/90 text-black hover:bg-white">
                                            <Play className="h-6 w-6" />
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-lg truncate">{playlist.name}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {playlist.description}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Music className="h-3 w-3" />
                                            {playlist.track_count} tracks
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {playlist.is_public ? (
                                                <Badge variant="outline" className="text-xs">
                                                    <Globe className="h-3 w-3 mr-1" />
                                                    Public
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs">
                                                    <Lock className="h-3 w-3 mr-1" />
                                                    Private
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Created {new Date(playlist.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {/* Create new playlist card */}
                    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed border-2 border-muted-foreground/30 hover:border-primary">
                        <CardContent className="p-0">
                            <div className="aspect-square flex items-center justify-center rounded-t-lg bg-muted/30">
                                <Plus className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="p-6 text-center">
                                <h4 className="font-semibold text-lg mb-2">Create New Playlist</h4>
                                <p className="text-sm text-muted-foreground">
                                    Start curating your next musical journey
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            {/* Playlist Details Tab */}
            <TabsContent value="details" className="space-y-6">
                {selectedPlaylist ? (
                    <>
                        <div className="flex items-start gap-6">
                            <div className="relative">
                                <div className="w-48 h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                                    <Music className="h-16 w-16 text-white opacity-90" />
                                </div>
                                <Button 
                                    size="icon" 
                                    className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
                                >
                                    <Play className="h-6 w-6" />
                                </Button>
                            </div>
                            
                            <div className="flex-1">
                                <Badge variant="outline" className="mb-2">Playlist</Badge>
                                <h1 className="text-4xl font-bold mb-2">{selectedPlaylist.name}</h1>
                                <p className="text-muted-foreground text-lg mb-4">{selectedPlaylist.description}</p>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        You
                                    </span>
                                    <span>•</span>
                                    <span>{selectedPlaylist.track_count} tracks</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        {selectedPlaylist.is_public ? (
                                            <>
                                                <Globe className="h-4 w-4" />
                                                Public
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-4 w-4" />
                                                Private
                                            </>
                                        )}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-4">
                                    <Button>
                                        <Play className="h-4 w-4 mr-2" />
                                        Play All
                                    </Button>
                                    <Button variant="outline">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Songs
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Tracks list */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-muted-foreground border-b">
                                <div className="col-span-1">#</div>
                                <div className="col-span-6">Title</div>
                                <div className="col-span-3">Album</div>
                                <div className="col-span-1">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div className="col-span-1"></div>
                            </div>
                            
                            {selectedPlaylist.tracks.map((track, index) => (
                                <div 
                                    key={track.id} 
                                    className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="col-span-1 flex items-center">
                                        <span className="text-muted-foreground group-hover:hidden">{index + 1}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hidden group-hover:flex">
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    
                                    <div className="col-span-6 flex items-center gap-3">
                                        <img
                                            src={track.track_thumbnail}
                                            alt={track.track_title}
                                            className="h-12 w-12 rounded object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{track.track_title}</p>
                                            <p className="text-sm text-muted-foreground truncate">{track.artist_name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-span-3 flex items-center">
                                        <span className="text-sm text-muted-foreground truncate">{track.album_name}</span>
                                    </div>
                                    
                                    <div className="col-span-1 flex items-center">
                                        <span className="text-sm text-muted-foreground">{track.duration}</span>
                                    </div>
                                    
                                    <div className="col-span-1 flex items-center">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Select a Playlist</h3>
                        <p className="text-muted-foreground">
                            Choose a playlist to view its details and tracks
                        </p>
                        <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setActiveTab('playlists')}
                        >
                            Browse Playlists
                        </Button>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}

export default LibraryTabs