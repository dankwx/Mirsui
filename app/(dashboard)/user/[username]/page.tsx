// app/user/[username]/page.tsx
import { notFound } from 'next/navigation'
import ProfilePageComponent from '@/components/Profile/ProfilePage'
import SongsList from '@/components/Profile/SongsList'
import ProfileFooter from '@/components/Profile/ProfileFooter'
import { isEarly } from '@/components/Profile/early'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import { fetchSongs } from '@/utils/fetchSongs'
import { fetchProfileComments } from '@/utils/profileCommentsService'
import Recados from '@/components/Profile/Recados/Recados'
import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'

interface ProfilePageParams {
    params: { username: string }
}

const MONTHS_UP = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

const hashStr = (s: string) => {
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return h
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
        recados,
    ] = await Promise.all([
        fetchSongs(userData.id, currentUserId),
        supabase.rpc('get_user_achievements', { user_uuid: userData.id }),
        supabase.rpc('get_user_rating', { user_uuid: userData.id }),
        supabase.rpc('get_user_followers', { user_uuid: userData.id }),
        supabase.rpc('get_user_following', { user_uuid: userData.id }),
        fetchProfileComments(userData.id),
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

    // Selo editorial — derivados determinísticos (mockup) a partir do perfil
    const seed = hashStr(userData.username || userData.id)
    const profileNo = String(seed % 1000).padStart(3, '0')
    const faroTop = (seed % 14) + 2 // TOP 2%–15%
    const memberSince = 2023 + (seed % 2) // 2023 / 2024
    const now = new Date()
    const edition = `${MONTHS_UP[now.getMonth()]} ${now.getFullYear()}`

    return (
        <div className="w-full bg-[#16120c]">
            <ProfilePageComponent
                userData={profileData}
                stats={stats}
                isLoggedIn={isLoggedIn}
                isOwnProfile={isOwnProfile}
                profileNo={profileNo}
                edition={edition}
                memberSince={memberSince}
                faroTop={faroTop}
            />

            <SongsList
                songs={songs}
                canRemove={isOwnProfile}
                userData={{
                    display_name: profileData.display_name || profileData.username,
                    username: profileData.username,
                    avatar_url: profileData.avatar_url,
                }}
            />

            <section className="w-full border-t border-[#ece3d2]/10 bg-[#16120c]">
                <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8">
                    <Recados
                        profileId={userData.id}
                        currentUserId={currentUserId}
                        initialComments={recados.comments}
                        total={recados.total}
                    />
                </div>
            </section>

            <ProfileFooter profileNo={profileNo} memberSince={memberSince} />
        </div>
    )
}
