// utils/libraryService.client.ts
import { createClient } from '@/utils/supabase/client'

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
    thumbnail_url: string | null
    created_at: string
    updated_at: string
    track_count: number
    tracks?: PlaylistTrack[]
}

/**
 * Cria uma nova playlist (client-side)
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
            .select('id, name, description, thumbnail_url, created_at, updated_at')
            .single()

        if (error) {
            console.error('Error creating playlist:', error)
            return null
        }

        return {
            ...data,
            thumbnail_url: data.thumbnail_url || null,
            track_count: 0,
            tracks: []
        }
    } catch (error) {
        console.error('Error in createPlaylist:', error)
        return null
    }
}

/**
 * Atualiza uma playlist (client-side)
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

/**
 * Deleta uma playlist (client-side)
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
 * Remove uma track de uma playlist (client-side)
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
 * Busca os tracks de uma playlist (client-side)
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
 * Upload de thumbnail para playlist
 */
export async function uploadPlaylistThumbnail(
    playlistId: string,
    file: File
): Promise<{ success: boolean; thumbnailUrl?: string; error?: string }> {
    const supabase = createClient()
    
    try {
        // Upload do arquivo para o storage
        const filePath = `playlists/${playlistId}/thumbnail`
        
        const { error: uploadError } = await supabase.storage
            .from('playlist-thumbnails')
            .upload(filePath, file, {
                cacheControl: '300',
                upsert: true,
            })

        if (uploadError) {
            console.error('Error uploading thumbnail:', uploadError)
            return { success: false, error: 'Failed to upload image' }
        }

        // Obter URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
            .from('playlist-thumbnails')
            .getPublicUrl(filePath)

        // Atualizar a playlist com a nova URL
        const { error: updateError } = await supabase
            .from('playlists')
            .update({ thumbnail_url: publicUrl })
            .eq('id', playlistId)

        if (updateError) {
            console.error('Error updating playlist thumbnail:', updateError)
            return { success: false, error: 'Failed to update playlist' }
        }

        return { success: true, thumbnailUrl: publicUrl }
    } catch (error) {
        console.error('Error in uploadPlaylistThumbnail:', error)
        return { success: false, error: 'Unexpected error occurred' }
    }
}