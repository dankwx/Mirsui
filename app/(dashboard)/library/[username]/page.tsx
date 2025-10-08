// app/(dashboard)/library/[username]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import LibraryHeader from '@/components/Library/LibraryHeader'
import LibraryTabs from '@/components/Library/LibraryTabs'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import { fetchSongs } from '@/utils/fetchSongs'
import { 
    fetchUserPlaylistsWithTracks, 
    calculateLibraryStats 
} from '@/utils/libraryService'

interface LibraryPageParams {
    params: { username: string }
}

export default async function LibraryPage({ params }: LibraryPageParams) {
    // Buscar dados do usuário pelo username
    const { userData, error } = await fetchUserData(params.username)
    
    if (error || !userData) {
        notFound()
    }

    const authData = await fetchAuthData()
    const isLoggedIn = !!authData?.user
    const isOwnLibrary = authData?.user?.id === userData.id
    const currentUserId = authData?.user?.id
    const targetUserId = userData.id

    // Buscar músicas salvas do usuário alvo
    const songs = await fetchSongs(targetUserId, currentUserId)

    // Buscar playlists do usuário alvo
    const playlists = await fetchUserPlaylistsWithTracks(targetUserId)

    // Buscar dados adicionais do Supabase
    const supabase = createClient()
    const [
        achievementResult,
        ratingResult,
        followersResult,
        followingResult,
    ] = await Promise.all([
        supabase.rpc('get_user_achievements', { user_uuid: targetUserId }),
        supabase.rpc('get_user_rating', { user_uuid: targetUserId }),
        supabase.rpc('get_user_followers', { user_uuid: targetUserId }),
        supabase.rpc('get_user_following', { user_uuid: targetUserId }),
    ])

    // Calcular estatísticas da biblioteca
    const stats = await calculateLibraryStats(targetUserId, songs)

    const libraryData = {
        user: {
            ...userData,
            id: targetUserId,
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
                    isOwnLibrary={isOwnLibrary}
                />
                
                <LibraryTabs
                    playlists={libraryData.playlists}
                    userId={targetUserId}
                    isOwnLibrary={isOwnLibrary}
                />
            </div>
        </div>
    )
}