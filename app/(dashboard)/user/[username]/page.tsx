// app/user/[username]/page.tsx
import { notFound } from 'next/navigation'
import ProfilePageComponent from '@/components/Profile/ProfilePage'
import SongsList from '@/components/Profile/SongsList'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import { fetchSongs } from '@/utils/fetchSongs'
import { createClient } from '@/utils/supabase/server'
import type { User, Achievement, Rating } from '@/types/profile'
import type { Metadata } from 'next'

interface ProfilePageParams {
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
            title: 'Usuário não encontrado - Mirsui',
            description: 'Este perfil não foi encontrado no Mirsui.',
        }
    }

    const displayName = userData.display_name || userData.username || 'Usuário'
    
    return {
        title: `${displayName} (@${userData.username}) | Mirsui`,
        description: `Veja o perfil de ${displayName} no Mirsui. Descubra suas descobertas musicais e credibilidade hipster.`,
    }
}

export default async function ProfilePage({ params }: ProfilePageParams) {
    const { userData, error } = await fetchUserData(params.username)

    if (error || !userData) {
        notFound()
    }

    const authData = await fetchAuthData()
    const isLoggedIn = !!authData?.user
    const isOwnProfile = authData?.user?.id === userData.id
    const currentUserId = authData?.user?.id

    // Fetch only songs and profile data
    const [
        songs,
        achievementResult,
        ratingResult,
        followersResult,
        followingResult,
    ] = await Promise.all([
        fetchSongs(userData.id, currentUserId),
        createClient().rpc('get_user_achievements', { user_uuid: userData.id }),
        createClient().rpc('get_user_rating', { user_uuid: userData.id }),
        createClient().rpc('get_user_followers', { user_uuid: userData.id }),
        createClient().rpc('get_user_following', { user_uuid: userData.id }),
    ])

    const profileData = {
        ...userData,
        totalFollowers: followersResult.data || [],
        totalFollowing: followingResult.data || [],
        achievements: achievementResult.data || [],
        rating: ratingResult.data || [],
    }

    return (
        <div className="px-6 py-6 font-sans min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
            <ProfilePageComponent
                userData={profileData}
                isLoggedIn={isLoggedIn}
                isOwnProfile={isOwnProfile}
            />

            <div className="py-8">
                {/* Header das músicas salvas */}
                <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-xl">
                    <h2 className="text-2xl font-bold text-slate-900">Saved Songs</h2>
                    <span className="text-lg text-slate-600 bg-gradient-to-br from-purple-100 to-pink-100 px-4 py-2 rounded-full font-semibold">
                        {songs.length} {songs.length === 1 ? 'track' : 'tracks'}
                    </span>
                </div>

                {/* Lista de músicas salvas */}
                <div className="w-full">
                    <SongsList 
                        songs={songs} 
                        canRemove={isOwnProfile} 
                        userData={{
                            display_name: profileData.display_name || profileData.username,
                            username: profileData.username,
                            avatar_url: profileData.avatar_url
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
