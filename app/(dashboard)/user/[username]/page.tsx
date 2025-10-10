// app/user/[username]/page.tsx
import { notFound } from 'next/navigation'
import ProfilePageComponent from '@/components/Profile/ProfilePage'
import SongsList from '@/components/Profile/SongsList'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import { fetchSongs } from '@/utils/fetchSongs'
import { createClient } from '@/utils/supabase/server'
import type { User, Achievement, Rating } from '@/types/profile'

interface ProfilePageParams {
    params: { username: string }
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
        <div className="px-6 py-6 font-sans">
            <ProfilePageComponent
                userData={profileData}
                isLoggedIn={isLoggedIn}
                isOwnProfile={isOwnProfile}
            />

            <div className="py-8">
                {/* Header das músicas salvas */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Saved Songs</h2>
                    <span className="text-lg text-muted-foreground">
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
