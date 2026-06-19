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
    thumbnail_url: string | null
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
    const supabase = await createClient()

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
    const supabase = await createClient()

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
