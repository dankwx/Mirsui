// app/user/[username]/page.tsx
import { notFound } from 'next/navigation'
import ProfilePageComponent from '@/components/Profile/ProfilePage'
import SongsList from '@/components/Profile/SongsList'
import { isEarly } from '@/components/Profile/early'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import { fetchSongs } from '@/utils/fetchSongs'
import { createClient } from '@/utils/supabase/server'
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

    const supabase = await createClient()

    // Fetch only songs and profile data
    const [
        rawSongs,
        achievementResult,
        ratingResult,
        followersResult,
        followingResult,
    ] = await Promise.all([
        fetchSongs(userData.id, currentUserId),
        supabase.rpc('get_user_achievements', { user_uuid: userData.id }),
        supabase.rpc('get_user_rating', { user_uuid: userData.id }),
        supabase.rpc('get_user_followers', { user_uuid: userData.id }),
        supabase.rpc('get_user_following', { user_uuid: userData.id }),
    ])

    const songs = Array.isArray(rawSongs) ? rawSongs : []

    const profileData = {
        ...userData,
        totalFollowers: followersResult.data || [],
        totalFollowing: followingResult.data || [],
        achievements: achievementResult.data || [],
        rating: ratingResult.data || [],
    }

    const stats = {
        tracks: songs.length,
        early: songs.filter(isEarly).length,
        artists: new Set(
            songs.map((s) => s.artist_name.split(',')[0].trim())
        ).size,
    }

    return (
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-10 lg:px-14">
            <ProfilePageComponent
                userData={profileData}
                stats={stats}
                isLoggedIn={isLoggedIn}
                isOwnProfile={isOwnProfile}
            />

            <div className="h-px bg-mir-line" />

            <SongsList
                songs={songs}
                canRemove={isOwnProfile}
                userData={{
                    display_name: profileData.display_name || profileData.username,
                    username: profileData.username,
                    avatar_url: profileData.avatar_url,
                }}
            />
        </div>
    )
}
