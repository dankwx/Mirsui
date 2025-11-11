'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    Music, 
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
    isOwnLibrary?: boolean
}

const LibraryTabs: React.FC<LibraryTabsProps> = ({ playlists: initialPlaylists, userId, isOwnLibrary = true }) => {
    const [activeTab, setActiveTab] = useState('playlists')
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
    const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists)
    const [isLoading, setIsLoading] = useState(false)
    const [addMusicDialogOpen, setAddMusicDialogOpen] = useState(false)
    const [thumbnailUploadOpen, setThumbnailUploadOpen] = useState(false)
    const [playlistForThumbnail, setPlaylistForThumbnail] = useState<Playlist | null>(null)
    const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false)
    
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 rounded-full border border-white/10 bg-white/[0.05] p-1 text-[11px] uppercase tracking-[0.3em] text-white/50 shadow-[0_18px_45px_rgba(8,4,20,0.4)] backdrop-blur-lg lg:w-auto">
                    <TabsTrigger
                        value="playlists"
                        className="rounded-full text-white/60 transition data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-[0_14px_40px_rgba(137,97,255,0.35)]"
                    >
                        My Playlists
                    </TabsTrigger>
                    <TabsTrigger
                        value="details"
                        className="rounded-full text-white/60 transition data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-[0_14px_40px_rgba(137,97,255,0.35)]"
                    >
                        Playlist Details
                    </TabsTrigger>
                </TabsList>

            {/* Playlists Tab */}
            <TabsContent value="playlists" className="mt-0 space-y-6">
                <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-6 shadow-[0_22px_55px_rgba(8,4,20,0.35)] backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                        <h3 className="text-2xl font-semibold tracking-tight text-white">My Playlists</h3>
                        <p className="text-sm text-white/60">Organize suas descobertas musicais.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/65">
                            {playlists.length} playlists
                        </span>
                        {isOwnLibrary && (
                            <CreatePlaylistDialog 
                                onCreatePlaylist={handleCreatePlaylist}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {playlists.map((playlist) => (
                        <Card
                            key={playlist.id}
                            className="group cursor-pointer overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05] shadow-[0_22px_55px_rgba(8,4,20,0.35)] transition duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_28px_65px_rgba(8,4,20,0.45)]"
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
                            }}
                        >
                            <CardContent className="p-0">
                                <div className="relative aspect-[4/3] rounded-t-[22px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
                                    {playlist.thumbnail_url ? (
                                        <>
                                            <img 
                                                src={playlist.thumbnail_url} 
                                                alt={playlist.name}
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Music className="h-12 w-12 text-white/80" />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="space-y-3 p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1 space-y-1.5">
                                            <h4 className="truncate text-base font-semibold tracking-tight text-white">{playlist.name}</h4>
                                            <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
                                                {playlist.description || 'No description'}
                                            </p>
                                        </div>
                                        {isOwnLibrary && (
                                            <PlaylistMenu 
                                                playlist={playlist}
                                                onUpdate={handleUpdatePlaylist}
                                                onDelete={handleDeletePlaylist}
                                                variant="card"
                                            />
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-1 text-xs text-white/55">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                                            <Music className="h-3.5 w-3.5 text-purple-300" />
                                            {playlist.track_count} tracks
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1 text-xs text-white/45">
                                        <Calendar className="h-3 w-3 text-white/55" />
                                        Created {new Date(playlist.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {/* Create new playlist card */}
                    {isOwnLibrary && (
                        <Card
                            className="group cursor-pointer overflow-hidden rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] shadow-[0_20px_50px_rgba(8,4,20,0.3)] transition hover:border-white/30 hover:bg-white/[0.06]"
                            onClick={() => setCreatePlaylistOpen(true)}
                        >
                            <CardContent className="p-0">
                                <div className="flex aspect-[4/3] items-center justify-center rounded-t-[22px] bg-gradient-to-br from-purple-500/15 via-purple-500/10 to-pink-500/15">
                                    <Plus className="h-12 w-12 text-purple-300 transition duration-300 group-hover:scale-110 group-hover:text-purple-200" />
                                </div>
                                <div className="space-y-1 p-5 text-center">
                                    <h4 className="text-base font-semibold tracking-tight text-white">Create New Playlist</h4>
                                    <p className="text-xs text-white/60">Start curating your next journey sonora.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </TabsContent>

            {/* Playlist Details Tab */}
            <TabsContent value="details" className="mt-0 space-y-6">
                {selectedPlaylist ? (
                    <>
                        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_30px_80px_rgba(8,4,20,0.4)] backdrop-blur-lg sm:px-8 sm:py-10">
                            <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,92,255,0.22),_transparent_65%)] blur-3xl" />
                            <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,113,181,0.2),_transparent_65%)] blur-3xl" />

                            <div className="relative flex flex-col gap-6 md:flex-row">
                            <div className="relative">
                                <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 shadow-[0_25px_60px_rgba(8,4,20,0.45)]">
                                    {selectedPlaylist.thumbnail_url ? (
                                        <img 
                                            src={selectedPlaylist.thumbnail_url} 
                                            alt={selectedPlaylist.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Music className="h-16 w-16 text-white/80" />
                                    )}
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex-1 space-y-4">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/60">
                                    Playlist
                                </span>
                                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-[2.5rem]">{selectedPlaylist.name}</h1>
                                <p className="text-sm leading-relaxed text-white/65 md:text-base">{selectedPlaylist.description || 'No description'}</p>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-white/55">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4 text-emerald-300" />
                                        You
                                    </span>
                                    <span>•</span>
                                    <span>{selectedPlaylist.track_count} tracks</span>
                                    <span>•</span>
                                </div>
                                
                                {isOwnLibrary && (
                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setAddMusicDialogOpen(true)}
                                            className="rounded-full border border-white/15 bg-white/[0.05] px-5 py-2 text-sm font-medium text-white/80 transition hover:border-white/25 hover:bg-white/[0.1] hover:text-white"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
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
                                )}
                            </div>
                            </div>
                        </div>

                        {/* Tracks list */}
                        <div className="space-y-2 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_65px_rgba(8,4,20,0.35)] backdrop-blur-lg">
                            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm uppercase tracking-[0.25em] text-white/45 border-b border-white/10">
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
                                    className="grid grid-cols-12 gap-4 px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-white/[0.07] hover:shadow-[0_14px_40px_rgba(8,4,20,0.35)]"
                                >
                                    <div className="col-span-1 flex items-center">
                                        <span className="font-medium text-white/55">{index + 1}</span>
                                    </div>
                                    
                                    <div className="col-span-6 flex items-center gap-3">
                                        <img
                                            src={track.track_thumbnail || '/placeholder-album.svg'}
                                            alt={track.track_title}
                                            className="h-12 w-12 rounded-lg object-cover shadow-[0_12px_30px_rgba(8,4,20,0.45)]"
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-white">{track.track_title}</p>
                                            <p className="truncate text-sm text-white/65">{track.artist_name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-span-3 flex items-center">
                                        <span className="truncate text-sm text-white/55">{track.album_name}</span>
                                    </div>
                                    
                                    <div className="col-span-1 flex items-center">
                                        <span className="text-sm text-white/55">{track.duration || '--:--'}</span>
                                    </div>
                                    
                                    <div className="col-span-1 flex items-center">
                                        {isOwnLibrary && (
                                            <TrackMenu 
                                                track={track}
                                                onRemove={handleRemoveTrack}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-8 py-14 text-center text-white/60 shadow-[0_20px_50px_rgba(8,4,20,0.35)]">
                        <Music className="mx-auto mb-4 h-16 w-16 text-white/40" />
                        <h3 className="text-xl font-semibold text-white">Select a Playlist</h3>
                        <p className="mt-2 text-sm text-white/60">
                            Choose a playlist to view its details and tracks
                        </p>
                        <Button
                            variant="outline"
                            className="mt-6 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm font-medium text-white/80 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                            onClick={() => setActiveTab('playlists')}
                        >
                            Browse Playlists
                        </Button>
                    </div>
                )}
            </TabsContent>
            </Tabs>

            {/* Dialog para adicionar músicas */}
            {selectedPlaylist && isOwnLibrary && (
                <AddMusicDialog
                    open={addMusicDialogOpen}
                    onOpenChange={setAddMusicDialogOpen}
                    playlistId={selectedPlaylist.id}
                    playlistName={selectedPlaylist.name}
                    onTrackAdded={handleTrackAdded}
                />
            )}

            {/* Dialog para upload de thumbnail */}
            {playlistForThumbnail && isOwnLibrary && (
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

            {/* Dialog para criar playlist */}
            {isOwnLibrary && (
                <CreatePlaylistDialog
                    open={createPlaylistOpen}
                    onOpenChange={setCreatePlaylistOpen}
                    onCreatePlaylist={handleCreatePlaylist}
                    isLoading={isLoading}
                    hideButton={true}
                />
            )}
        </>
    )
}

export default LibraryTabs