// app/user/[username]/page.tsx
import { notFound } from 'next/navigation'
import ProfileDetails from '@/components/Profile/ProfileDetails'
import CardsSection from '@/components/Profile/CardsSection'
import TabsSection from '@/components/Profile/TabsSection'
import { fetchArtists } from '@/utils/fetchArtists'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import { fetchSongs } from '@/utils/fetchSongs'
import { fetchChannels } from '@/utils/fetchChannels'
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

    // Fetch all data in parallel
    const [
        artists,
        songs,
        channels,
        achievementResult,
        ratingResult,
        followersResult,
        followingResult,
    ] = await Promise.all([
        fetchArtists(userData.id),
        fetchSongs(userData.id, currentUserId),
        fetchChannels(userData.id),
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

    const counters = {
        savedSongs: songs.length,
        savedChannels: channels.length,
        savedArtists: artists.length,
        followers: followersResult.data?.length || 0,
        following: followingResult.data?.length || 0,
    }

    return (
        <div className="px-6 font-sans">
            <ProfileDetails
                userData={profileData}
                isLoggedIn={isLoggedIn}
                isOwnProfile={isOwnProfile}
            />

            <div className="py-8">
                {/* CardsSection agora é server component, props são só dados puros */}
                <CardsSection
                    totalSavedSongs={counters.savedSongs}
                    totalSavedYouTubeChannels={counters.savedChannels}
                    totalSavedSpotifyArtists={counters.savedArtists}
                    totalFollowers={counters.followers}
                    totalFollowing={counters.following}
                />

                <div className="mt-8 w-full">
                    {/* TabsSection também server component, só recebe dados */}
                    <TabsSection
                        artists={artists}
                        songs={songs}
                        channels={channels}
                        canRemove={isOwnProfile}
                        currentUserId={currentUserId}
                    />
                </div>
            </div>
        </div>
    )
}
