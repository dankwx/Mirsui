// app/user/[username]/page.tsx
import { notFound } from 'next/navigation'
import ProfileHeader from '@/components/Profile/ProfileHeader'
import ChegouCedo from '@/components/Profile/ChegouCedo'
import ArtistasDoAcervo from '@/components/Profile/ArtistasDoAcervo'
import SongsList from '@/components/Profile/SongsList'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import { fetchSongs } from '@/utils/fetchSongs'
import { fetchProfileComments } from '@/utils/profileCommentsService'
import {
    buildProfileStats,
    buildTopArtists,
    buildEarliest,
    buildBadge,
    rankVitrine,
    countSaversByUri,
} from '@/utils/profileStats'
import Recados from '@/components/Profile/Recados/Recados'
import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'

interface ProfilePageParams {
    params: { username: string }
}

/** faixas na vitrine "Chegou cedo" (1 destaque + 4) */
const VITRINE = 5
/** candidatas contadas antes de escolher as cinco. Ver rankVitrine. */
const CANDIDATAS = 12

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
        description: `O acervo de ${displayName} no Mirsui: o que salvou, quando salvou e em que posição chegou.`,
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

    const stats = buildProfileStats(songs)
    const badge = buildBadge(stats, songs)
    const artists = buildTopArtists(songs, 6)
    const favorites = songs.filter((s) => s.is_favorited).slice(0, 4)
    // Conta quem salvou as doze mais cedo e só então escolhe as cinco: a
    // contagem é o critério de desempate entre as faixas em 1º.
    const candidatas = buildEarliest(songs, CANDIDATAS)
    const savers = await countSaversByUri(
        candidatas.map((song) => song.track_uri).filter((uri): uri is string => !!uri)
    )
    const vitrine = rankVitrine(candidatas, savers, VITRINE)

    return (
        <div className="w-full bg-mir-bg">
            <ProfileHeader
                userData={profileData}
                stats={stats}
                badge={badge}
                favorites={favorites}
                isLoggedIn={isLoggedIn}
                isOwnProfile={isOwnProfile}
            />

            <ChegouCedo songs={vitrine} savers={savers} />

            <ArtistasDoAcervo artists={artists} />

            <SongsList
                songs={songs}
                canRemove={isOwnProfile}
                userData={{
                    display_name: profileData.display_name || profileData.username || '',
                    username: profileData.username || '',
                    avatar_url: profileData.avatar_url,
                }}
            />

            <section className="w-full bg-mir-bg">
                <div className="mx-auto w-full max-w-[1200px] px-5 pb-8 sm:px-8">
                    <Recados
                        profileId={userData.id}
                        currentUserId={currentUserId}
                        initialComments={recados.comments}
                        total={recados.total}
                    />
                </div>
            </section>
        </div>
    )
}
