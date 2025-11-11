// app/user/[username]/page.tsx
import { notFound } from 'next/navigation'
import ProfilePageComponent from '@/components/Profile/ProfilePage'
import SongsList from '@/components/Profile/SongsList'
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

    const supabase = createClient()

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

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#05030f] font-sans text-white">
            <div className="pointer-events-none absolute -left-56 top-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,92,255,0.18),_transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-40 top-1/2 h-[540px] w-[540px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,113,181,0.16),_transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 bottom-0 h-[420px] w-[420px] -translate-x-1/2 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.12),_transparent_70%)] blur-[140px]" />

            <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 pt-10 sm:px-6 lg:px-8">
                <div className="space-y-10">
                    <ProfilePageComponent
                        userData={profileData}
                        isLoggedIn={isLoggedIn}
                        isOwnProfile={isOwnProfile}
                    />

                    <section className="space-y-5">
                        <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-5 shadow-[0_30px_80px_rgba(8,4,20,0.4)] backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
                                    biblioteca
                                </p>
                                <h2 className="text-3xl font-semibold tracking-tight text-white">
                                    Saved discoveries
                                </h2>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium uppercase tracking-[0.3em] text-white/65">
                                <span>{songs.length || 0}</span>
                                <span>{songs.length === 1 ? 'track' : 'tracks'}</span>
                            </div>
                        </div>

                        <div className="w-full">
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
                    </section>
                </div>
            </div>
        </div>
    )
}
