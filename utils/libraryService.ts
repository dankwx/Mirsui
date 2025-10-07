// utils/libraryService.ts
import { createClient } from '@/utils/supabase/server'

export interface PlaylistTrack {
    id: string
    track_title: string
    artist_name: string
    album_name: string
    track_thumbnail: string | null
    track_url: string
    duration: string | null
    track_position: number
    added_at: string
}

export interface Playlist {
    id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
    track_count: number
    tracks?: PlaylistTrack[]
}

export interface LibraryStats {
    totalTracks: number
    totalPlaylists: number
    hoursListened: number
    discoveryScore: number
    totalDiscoveries: number
}

/**
 * Busca todas as playlists do usuário
 */
export async function fetchUserPlaylists(userId: string): Promise<Playlist[]> {
    const supabase = createClient()
    
    try {
        const { data, error } = await supabase.rpc('get_user_playlists', {
            user_uuid: userId
        })

        if (error) {
            console.error('Error fetching user playlists:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error in fetchUserPlaylists:', error)
        return []
    }
}

/**
 * Busca os tracks de uma playlist específica
 */
export async function fetchPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]> {
    const supabase = createClient()
    
    try {
        const { data, error } = await supabase.rpc('get_playlist_tracks', {
            playlist_uuid: playlistId
        })

        if (error) {
            console.error('Error fetching playlist tracks:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error in fetchPlaylistTracks:', error)
        return []
    }
}

/**
 * Busca playlists com seus tracks incluídos
 */
export async function fetchUserPlaylistsWithTracks(userId: string): Promise<Playlist[]> {
    try {
        const playlists = await fetchUserPlaylists(userId)
        
        // Buscar tracks para cada playlist
        const playlistsWithTracks = await Promise.all(
            playlists.map(async (playlist) => {
                const tracks = await fetchPlaylistTracks(playlist.id)
                return {
                    ...playlist,
                    tracks
                }
            })
        )

        return playlistsWithTracks
    } catch (error) {
        console.error('Error in fetchUserPlaylistsWithTracks:', error)
        return []
    }
}

/**
 * Calcula estatísticas da biblioteca do usuário
 */
export async function calculateLibraryStats(userId: string, savedSongs: any[]): Promise<LibraryStats> {
    try {
        const playlists = await fetchUserPlaylists(userId)
        
        // Calcular total de tracks das playlists
        const totalPlaylistTracks = playlists.reduce((sum, playlist) => sum + playlist.track_count, 0)
        
        // Calcular descobertas (tracks com rating alto)
        const totalDiscoveries = savedSongs.filter(song => 
            song.discover_rating && song.discover_rating > 7
        ).length

        // Estimativa simples de horas ouvidas (baseada no número de tracks)
        const totalTracks = savedSongs.length + totalPlaylistTracks
        const estimatedHours = Math.round((totalTracks * 3.5) / 60 * 10) / 10 // 3.5 min média por track

        // Score de descoberta baseado em proporção de tracks com rating alto
        const discoveryScore = savedSongs.length > 0 
            ? Math.round((totalDiscoveries / savedSongs.length) * 10 * 10) / 10
            : 0

        return {
            totalTracks: savedSongs.length,
            totalPlaylists: playlists.length,
            hoursListened: estimatedHours,
            discoveryScore: Math.min(discoveryScore, 10), // Cap em 10
            totalDiscoveries
        }
    } catch (error) {
        console.error('Error calculating library stats:', error)
        return {
            totalTracks: savedSongs.length,
            totalPlaylists: 0,
            hoursListened: 0,
            discoveryScore: 0,
            totalDiscoveries: 0
        }
    }
}

/**
 * Cria uma nova playlist
 */
export async function createPlaylist(userId: string, name: string, description?: string): Promise<Playlist | null> {
    const supabase = createClient()
    
    try {
        const { data, error } = await supabase
            .from('playlists')
            .insert({
                name,
                description,
                user_id: userId
            })
            .select('id, name, description, created_at, updated_at')
            .single()

        if (error) {
            console.error('Error creating playlist:', error)
            return null
        }

        return {
            ...data,
            track_count: 0,
            tracks: []
        }
    } catch (error) {
        console.error('Error in createPlaylist:', error)
        return null
    }
}

/**
 * Adiciona uma track a uma playlist
 */
export async function addTrackToPlaylist(
    playlistId: string, 
    track: {
        track_title: string
        artist_name: string
        album_name: string
        track_thumbnail?: string
        track_url: string
        duration?: string
    }
): Promise<boolean> {
    const supabase = createClient()
    
    try {
        // Buscar a próxima posição
        const { data: positionData } = await supabase
            .from('playlist_tracks')
            .select('track_position')
            .eq('playlist_id', playlistId)
            .order('track_position', { ascending: false })
            .limit(1)

        const nextPosition = positionData && positionData.length > 0 
            ? positionData[0].track_position + 1 
            : 1

        const { error } = await supabase
            .from('playlist_tracks')
            .insert({
                playlist_id: playlistId,
                track_title: track.track_title,
                artist_name: track.artist_name,
                album_name: track.album_name,
                track_thumbnail: track.track_thumbnail,
                track_url: track.track_url,
                duration: track.duration,
                track_position: nextPosition
            })

        if (error) {
            console.error('Error adding track to playlist:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Error in addTrackToPlaylist:', error)
        return false
    }
}

/**
 * Remove uma track de uma playlist
 */
export async function removeTrackFromPlaylist(trackId: string): Promise<boolean> {
    const supabase = createClient()
    
    try {
        const { error } = await supabase
            .from('playlist_tracks')
            .delete()
            .eq('id', trackId)

        if (error) {
            console.error('Error removing track from playlist:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Error in removeTrackFromPlaylist:', error)
        return false
    }
}

/**
 * Deleta uma playlist
 */
export async function deletePlaylist(playlistId: string): Promise<boolean> {
    const supabase = createClient()
    
    try {
        const { error } = await supabase
            .from('playlists')
            .delete()
            .eq('id', playlistId)

        if (error) {
            console.error('Error deleting playlist:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Error in deletePlaylist:', error)
        return false
    }
}

/**
 * Atualiza uma playlist
 */
export async function updatePlaylist(
    playlistId: string, 
    updates: { name?: string; description?: string }
): Promise<boolean> {
    const supabase = createClient()
    
    try {
        const { error } = await supabase
            .from('playlists')
            .update(updates)
            .eq('id', playlistId)

        if (error) {
            console.error('Error updating playlist:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Error in updatePlaylist:', error)
        return false
    }
}