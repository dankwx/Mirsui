// app/(dashboard)/library/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import LibraryHeader from '@/components/Library/LibraryHeader'
import LibraryTabs from '@/components/Library/LibraryTabs'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import { fetchSongs } from '@/utils/fetchSongs'

// Dados mockados para playlists
const mockPlaylistTracks = [
    {
        id: 'track-1',
        track_title: 'Blinding Lights',
        artist_name: 'The Weeknd',
        album_name: 'After Hours',
        track_thumbnail: 'https://i.scdn.co/image/ab67616d0000b273c02e7d6c47c7e49ce1019ace',
        track_url: 'https://open.spotify.com/track/0VjIjW4GlULA0FGJSXmZRz',
        popularity: 95,
        discover_rating: 8.5,
        duration: '3:20'
    },
    {
        id: 'track-2',
        track_title: 'As It Was',
        artist_name: 'Harry Styles',
        album_name: "Harry's House",
        track_thumbnail: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0',
        track_url: 'https://open.spotify.com/track/2nLtzopw2G5vBdtEe9T0m8',
        popularity: 88,
        discover_rating: 7.2,
        duration: '2:47'
    },
    {
        id: 'track-3',
        track_title: 'Heat Waves',
        artist_name: 'Glass Animals',
        album_name: 'Dreamland',
        track_thumbnail: 'https://i.scdn.co/image/ab67616d0000b273b33d346d3be05c4e86f95881',
        track_url: 'https://open.spotify.com/track/6fTt0CF9EjDEsVeWgGGzfO',
        popularity: 82,
        discover_rating: 9.1,
        duration: '3:58'
    }
]

const mockPlaylists = [
    {
        id: 'playlist-1',
        name: 'My Discovery Mix',
        description: 'Tracks I discovered before they went viral',
        track_count: 47,
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b273f7b7c9ac5e1fc7d5b5b4b8e3',
        created_at: '2024-01-01',
        is_public: false,
        tracks: mockPlaylistTracks
    },
    {
        id: 'playlist-2',
        name: 'Underground Gems',
        description: 'Hidden tracks with huge potential',
        track_count: 23,
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b2734f5c8b5e8f5e8f5e8f5e8f5e',
        created_at: '2024-01-10',
        is_public: true,
        tracks: mockPlaylistTracks.slice(0, 2)
    },
    {
        id: 'playlist-3',
        name: 'Viral Predictions',
        description: 'These will be hits soon',
        track_count: 15,
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b2735f5e8f5e8f5e8f5e8f5e8f5e',
        created_at: '2024-01-14',
        is_public: true,
        tracks: [mockPlaylistTracks[2]]
    },
    {
        id: 'playlist-4',
        name: 'Chill Discoveries',
        description: 'Relaxing tracks for focus',
        track_count: 32,
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b273a5b5b4b8e3f7b7c9ac5e1fc7',
        created_at: '2024-01-20',
        is_public: false,
        tracks: mockPlaylistTracks
    }
]

export default async function LibraryPage() {
    const authData = await fetchAuthData()
    
    if (!authData?.user) {
        redirect('/login')
    }

    const currentUserId = authData.user.id

    // Buscar dados reais do usuário
    const { userData } = await fetchUserData(authData.user.user_metadata?.username || authData.user.email || '')
    
    // Buscar músicas salvas reais
    const songs = await fetchSongs(currentUserId, currentUserId)

    // Buscar dados adicionais do Supabase
    const supabase = createClient()
    const [
        achievementResult,
        ratingResult,
        followersResult,
        followingResult,
    ] = await Promise.all([
        supabase.rpc('get_user_achievements', { user_uuid: currentUserId }),
        supabase.rpc('get_user_rating', { user_uuid: currentUserId }),
        supabase.rpc('get_user_followers', { user_uuid: currentUserId }),
        supabase.rpc('get_user_following', { user_uuid: currentUserId }),
    ])

    const libraryData = {
        user: {
            ...userData,
            id: currentUserId,
            achievements: achievementResult.data || [],
            rating: ratingResult.data || [],
            followers: followersResult.data || [],
            following: followingResult.data || [],
        },
        playlists: mockPlaylists,
        stats: {
            totalTracks: songs.length,
            totalPlaylists: mockPlaylists.length,
            hoursListened: 127.5,
            discoveryScore: 8.9,
            totalDiscoveries: songs.filter(song => song.discover_rating && song.discover_rating > 7).length
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="px-6 py-6">
                <LibraryHeader 
                    userData={libraryData.user}
                    stats={libraryData.stats}
                />
                
                <LibraryTabs
                    playlists={libraryData.playlists}
                />
            </div>
        </div>
    )
}