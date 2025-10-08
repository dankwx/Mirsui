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
import CreatePlaylistDialog from './CreatePlaylistDialog'
import PlaylistMenu from './PlaylistMenu'
import TrackMenu from './TrackMenu'
import AddMusicDialog from './AddMusicDialog'
import PlaylistThumbnailUpload from './PlaylistThumbnailUpload'
import { createPlaylist, updatePlaylist, deletePlaylist, removeTrackFromPlaylist, fetchPlaylistTracks, uploadPlaylistThumbnail } from '@/utils/libraryService.client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface PlaylistTrack {
    id: string
    track_title: string
    artist_name: string
    album_name: string
    track_thumbnail: string | null
    track_url: string
    duration: string | null
    track_position?: number
    added_at?: string
}

interface Playlist {
    id: string
    name: string
    description: string | null
    thumbnail_url: string | null
    track_count: number
    created_at: string
    updated_at?: string
    tracks?: PlaylistTrack[]
}

interface LibraryTabsProps {
    playlists: Playlist[]
    userId?: string
}

const LibraryTabs: React.FC<LibraryTabsProps> = ({ playlists: initialPlaylists, userId }) => {
    const [activeTab, setActiveTab] = useState('playlists')
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
    const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists)
    const [isLoading, setIsLoading] = useState(false)
    const [addMusicDialogOpen, setAddMusicDialogOpen] = useState(false)
    const [thumbnailUploadOpen, setThumbnailUploadOpen] = useState(false)
    const [playlistForThumbnail, setPlaylistForThumbnail] = useState<Playlist | null>(null)
    
    const router = useRouter()
    const { toast } = useToast()

    // Função para criar playlist
    const handleCreatePlaylist = async (name: string, description: string, thumbnail?: File) => {
        if (!userId) return
        
        setIsLoading(true)
        try {
            const newPlaylist = await createPlaylist(userId, name, description)
            if (newPlaylist) {
                let playlistWithThumbnail = newPlaylist
                
                // Se há thumbnail, fazer upload
                if (thumbnail) {
                    const uploadResult = await uploadPlaylistThumbnail(newPlaylist.id, thumbnail)
                    if (uploadResult.success && uploadResult.thumbnailUrl) {
                        playlistWithThumbnail = {
                            ...newPlaylist,
                            thumbnail_url: uploadResult.thumbnailUrl
                        }
                    }
                }
                
                setPlaylists(prev => [playlistWithThumbnail, ...prev])
                router.refresh() // Atualiza a página para refletir mudanças
            }
        } catch (error) {
            throw error // Re-throw para o componente tratar
        } finally {
            setIsLoading(false)
        }
    }

    // Função para atualizar playlist
    const handleUpdatePlaylist = async (playlistId: string, name: string, description: string) => {
        setIsLoading(true)
        try {
            const success = await updatePlaylist(playlistId, { name, description })
            if (success) {
                setPlaylists(prev => prev.map(p => 
                    p.id === playlistId 
                        ? { ...p, name, description }
                        : p
                ))
                
                // Atualizar playlist selecionada se for a mesma
                if (selectedPlaylist?.id === playlistId) {
                    setSelectedPlaylist(prev => prev ? { ...prev, name, description } : null)
                }
                
                router.refresh()
            }
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // Função para deletar playlist
    const handleDeletePlaylist = async (playlistId: string) => {
        setIsLoading(true)
        try {
            const success = await deletePlaylist(playlistId)
            if (success) {
                setPlaylists(prev => prev.filter(p => p.id !== playlistId))
                
                // Se a playlist deletada estava selecionada, voltar para a aba de playlists
                if (selectedPlaylist?.id === playlistId) {
                    setSelectedPlaylist(null)
                    setActiveTab('playlists')
                }
                
                router.refresh()
            }
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // Função para remover track da playlist
    const handleRemoveTrack = async (trackId: string) => {
        if (!selectedPlaylist) return
        
        setIsLoading(true)
        try {
            const success = await removeTrackFromPlaylist(trackId)
            if (success) {
                // Atualizar o estado local da playlist selecionada
                const updatedTracks = (selectedPlaylist.tracks || []).filter(t => t.id !== trackId)
                const updatedPlaylist = {
                    ...selectedPlaylist,
                    tracks: updatedTracks,
                    track_count: updatedTracks.length
                }
                setSelectedPlaylist(updatedPlaylist)
                
                // Atualizar também na lista de playlists
                setPlaylists(prev => prev.map(p => 
                    p.id === selectedPlaylist.id 
                        ? { 
                            ...p, 
                            track_count: updatedTracks.length,
                            tracks: updatedTracks
                          }
                        : p
                ))
            }
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // Função chamada quando uma música é adicionada
    const handleTrackAdded = async () => {
        if (!selectedPlaylist) return
        
        try {
            // Buscar os tracks atualizados da playlist
            const updatedTracks = await fetchPlaylistTracks(selectedPlaylist.id)
            
            // Atualizar a playlist selecionada com os novos tracks
            const updatedPlaylist = {
                ...selectedPlaylist,
                tracks: updatedTracks,
                track_count: updatedTracks.length
            }
            
            setSelectedPlaylist(updatedPlaylist)
            
            // Atualizar também na lista de playlists para que os cards mostrem o count correto
            setPlaylists(prev => prev.map(p => 
                p.id === selectedPlaylist.id 
                    ? { 
                        ...p, 
                        track_count: updatedTracks.length,
                        // Manter as tracks atualizadas também na lista para futuras navegações
                        tracks: updatedTracks
                      }
                    : p
            ))
            
        } catch (error) {
            console.error('Error updating playlist data:', error)
            // Se falhar, fazer refresh como fallback
            router.refresh()
        }
    }

    // Função para abrir o modal de thumbnail
    const handleThumbnailClick = (playlist: Playlist) => {
        // Criar uma cópia independente da playlist para o modal
        // Isso evita interferência com o estado da playlist selecionada
        const playlistCopy = {
            id: playlist.id,
            name: playlist.name,
            description: playlist.description,
            thumbnail_url: playlist.thumbnail_url,
            created_at: playlist.created_at,
            updated_at: playlist.updated_at || playlist.created_at,
            track_count: playlist.track_count
        }
        
        setPlaylistForThumbnail(playlistCopy)
        setThumbnailUploadOpen(true)
    }

    // Função chamada quando thumbnail é atualizada com sucesso
    const handleThumbnailSuccess = (thumbnailUrl: string) => {
        if (!playlistForThumbnail) return
        
        // Atualizar a playlist na lista principal
        setPlaylists(prev => prev.map(p => 
            p.id === playlistForThumbnail.id 
                ? { ...p, thumbnail_url: thumbnailUrl }
                : p
        ))
        
        // Se é a playlist selecionada, atualizar também SEM afetar as tracks
        if (selectedPlaylist?.id === playlistForThumbnail.id) {
            setSelectedPlaylist(prev => prev ? { ...prev, thumbnail_url: thumbnailUrl } : null)
        }
        
        // Fechar modal
        setThumbnailUploadOpen(false)
        setPlaylistForThumbnail(null)
    }

    return (
        <>
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
                        <CreatePlaylistDialog 
                            onCreatePlaylist={handleCreatePlaylist}
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {playlists.map((playlist) => (
                        <Card key={playlist.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                              onClick={async () => {
                                  // Se é a mesma playlist que já está selecionada e ela tem tracks,
                                  // apenas navegar sem recarregar
                                  if (selectedPlaylist?.id === playlist.id && selectedPlaylist.tracks) {
                                      setActiveTab('details')
                                      return
                                  }
                                  
                                  // Para uma nova playlist ou playlist sem tracks carregadas,
                                  // carregar as tracks mais recentes
                                  setIsLoading(true)
                                  try {
                                      const tracks = await fetchPlaylistTracks(playlist.id)
                                      const playlistWithTracks = {
                                          ...playlist,
                                          tracks: tracks
                                      }
                                      setSelectedPlaylist(playlistWithTracks)
                                      setActiveTab('details')
                                  } catch (error) {
                                      console.error('Error loading playlist tracks:', error)
                                      // Fallback: usar playlist sem tracks
                                      setSelectedPlaylist({...playlist, tracks: []})
                                      setActiveTab('details')
                                  } finally {
                                      setIsLoading(false)
                                  }
                              }}>
                            <CardContent className="p-0">
                                <div className="relative aspect-square bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-t-lg flex items-center justify-center overflow-hidden">
                                    {playlist.thumbnail_url ? (
                                        <>
                                            <img 
                                                src={playlist.thumbnail_url} 
                                                alt={playlist.name}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <Music className="h-16 w-16 text-white opacity-90 z-10" />
                                        </>
                                    )}
                                    
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
                                                {playlist.description || 'No description'}
                                            </p>
                                        </div>
                                        <PlaylistMenu 
                                            playlist={playlist}
                                            onUpdate={handleUpdatePlaylist}
                                            onDelete={handleDeletePlaylist}
                                            variant="card"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Music className="h-3 w-3" />
                                            {playlist.track_count} tracks
                                        </span>
                                        <div className="flex items-center gap-2">
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
                                <div className="w-48 h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center overflow-hidden">
                                    {selectedPlaylist.thumbnail_url ? (
                                        <img 
                                            src={selectedPlaylist.thumbnail_url} 
                                            alt={selectedPlaylist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Music className="h-16 w-16 text-white opacity-90" />
                                    )}
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
                                <p className="text-muted-foreground text-lg mb-4">{selectedPlaylist.description || 'No description'}</p>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        You
                                    </span>
                                    <span>•</span>
                                    <span>{selectedPlaylist.track_count} tracks</span>
                                    <span>•</span>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-4">
                                    <Button>
                                        <Play className="h-4 w-4 mr-2" />
                                        Play All
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => setAddMusicDialogOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Songs
                                    </Button>
                                    <PlaylistMenu 
                                        playlist={selectedPlaylist}
                                        onUpdate={handleUpdatePlaylist}
                                        onDelete={handleDeletePlaylist}
                                        onChangeThumbnail={handleThumbnailClick}
                                        variant="details"
                                    />
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
                            
                            {(selectedPlaylist.tracks || []).map((track, index) => (
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
                                            src={track.track_thumbnail || '/placeholder-album.svg'}
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
                                        <span className="text-sm text-muted-foreground">{track.duration || '--:--'}</span>
                                    </div>
                                    
                                    <div className="col-span-1 flex items-center">
                                        <TrackMenu 
                                            track={track}
                                            onRemove={handleRemoveTrack}
                                        />
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

            {/* Dialog para adicionar músicas */}
            {selectedPlaylist && (
                <AddMusicDialog
                    open={addMusicDialogOpen}
                    onOpenChange={setAddMusicDialogOpen}
                    playlistId={selectedPlaylist.id}
                    playlistName={selectedPlaylist.name}
                    onTrackAdded={handleTrackAdded}
                />
            )}

            {/* Dialog para upload de thumbnail */}
            {playlistForThumbnail && (
                <PlaylistThumbnailUpload
                    playlistId={playlistForThumbnail.id}
                    playlistName={playlistForThumbnail.name}
                    currentThumbnail={playlistForThumbnail.thumbnail_url}
                    isOpen={thumbnailUploadOpen}
                    onClose={() => {
                        setThumbnailUploadOpen(false)
                        setPlaylistForThumbnail(null)
                    }}
                    onSuccess={handleThumbnailSuccess}
                />
            )}
        </>
    )
}

export default LibraryTabs