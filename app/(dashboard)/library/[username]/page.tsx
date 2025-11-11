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
import type { Metadata } from 'next'

interface LibraryPageParams {
    params: { username: string }
}

export async function generateMetadata({
    params,
}: {
    params: { username: string }
}): Promise<Metadata> {
    const { userData, error } = await fetchUserData(params.username)
    
    if (error || !userData) {
        return {
            title: 'Biblioteca não encontrada - Mirsui',
            description: 'Esta biblioteca não foi encontrada no Mirsui.',
        }
    }

    const displayName = userData.display_name || userData.username || 'Usuário'
    
    return {
        title: `Biblioteca de ${displayName} | Mirsui`,
        description: `Explore a biblioteca musical de ${displayName}. Veja suas descobertas, playlists e estatísticas musicais.`,
    }
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
        <div className="relative min-h-screen overflow-hidden bg-[#05030f] font-sans text-white">
            <div className="pointer-events-none absolute -left-64 top-28 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,92,255,0.18),_transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-48 top-1/2 h-[540px] w-[540px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,113,181,0.16),_transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 bottom-0 h-[420px] w-[420px] -translate-x-1/2 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.12),_transparent_70%)] blur-[140px]" />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-10 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    <LibraryHeader 
                        userData={libraryData.user}
                        stats={libraryData.stats}
                    />

                    <LibraryTabs
                        playlists={libraryData.playlists}
                        userId={targetUserId}
                        isOwnLibrary={isOwnLibrary}
                    />
                </div>
            </div>
        </div>
    )
}