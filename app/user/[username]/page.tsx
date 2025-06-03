// ===================================
// app/user/[username]/page.tsx
// ===================================

import { notFound } from 'next/navigation'
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import ProfileDetails from '@/components/Profile/ProfileDetails'
import CardsSection from '@/components/Profile/CardsSection'
import TabsSection from '@/components/Profile/TabsSection'
import { fetchArtists } from '@/utils/fetchArtists'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import { fetchSongs } from '@/utils/fetchSongs'
import { fetchChannels } from '@/utils/fetchChannels'
import { fetchFollowers, fetchFollowing } from '@/utils/fetchFollowersFollowing'
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

    // Fetch all data in parallel
    const [
        artists,
        songs,
        channels,
        followers,
        following,
        followersResult,
        followingResult,
        achievementResult,
        ratingResult,
    ] = await Promise.all([
        fetchArtists(userData.id),
        fetchSongs(userData.id),
        fetchChannels(userData.id),
        fetchFollowers(userData.id),
        fetchFollowing(userData.id),
        createClient().rpc('get_user_followers', { user_uuid: userData.id }),
        createClient().rpc('get_user_following', { user_uuid: userData.id }),
        createClient().rpc('get_user_achievements', { user_uuid: userData.id }),
        createClient().rpc('get_user_rating', { user_uuid: userData.id }),
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
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="ml-20 flex w-full flex-col px-6 font-sans">
                        <ProfileDetails
                            userData={profileData}
                            isLoggedIn={isLoggedIn}
                            isOwnProfile={isOwnProfile}
                        />

                        <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
                            <main className="py-8">
                                <CardsSection
                                    totalSavedSongs={counters.savedSongs}
                                    totalSavedYouTubeChannels={
                                        counters.savedChannels
                                    }
                                    totalSavedSpotifyArtists={
                                        counters.savedArtists
                                    }
                                    totalFollowers={followersResult.data || []}
                                    totalFollowing={followingResult.data || []}
                                />

                                <div className="mt-8 w-full">
                                    <TabsSection
                                        artists={artists}
                                        songs={songs}
                                        channels={channels}
                                        canRemove={isOwnProfile}
                                    />
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
