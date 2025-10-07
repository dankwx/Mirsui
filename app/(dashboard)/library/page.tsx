// app/(dashboard)/library/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import LibraryHeader from '@/components/Library/LibraryHeader'
import LibraryTabs from '@/components/Library/LibraryTabs'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import { fetchSongs } from '@/utils/fetchSongs'
import { 
    fetchUserPlaylistsWithTracks, 
    calculateLibraryStats 
} from '@/utils/libraryService'

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

    // Buscar playlists reais do usuário
    const playlists = await fetchUserPlaylistsWithTracks(currentUserId)

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

    // Calcular estatísticas da biblioteca
    const stats = await calculateLibraryStats(currentUserId, songs)

    const libraryData = {
        user: {
            ...userData,
            id: currentUserId,
            achievements: achievementResult.data || [],
            rating: ratingResult.data || [],
            followers: followersResult.data || [],
            following: followingResult.data || [],
        },
        playlists,
        stats
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
                    userId={currentUserId}
                />
            </div>
        </div>
    )
}