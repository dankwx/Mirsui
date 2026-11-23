// app/(club)/user/[username]/page.tsx
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
    buildFaro,
    rankVitrine,
    countSaversByUri,
} from '@/utils/profileStats'
import Recados from '@/components/Profile/Recados/Recados'
import shellStyles from '@/components/Club/ClubShell.module.css'
import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'
import styles from './page.module.css'

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
        faroResult,
    ] = await Promise.all([
        fetchSongs(userData.id, currentUserId),
        supabase.rpc('get_user_achievements', { user_uuid: userData.id }),
        supabase.rpc('get_user_rating', { user_uuid: userData.id }),
        supabase.rpc('get_user_followers', { user_uuid: userData.id }),
        supabase.rpc('get_user_following', { user_uuid: userData.id }),
        fetchProfileComments(userData.id),
        supabase.rpc('get_user_faro', { user_uuid: userData.id }),
    ])

    if (faroResult.error) console.error('Erro ao ler o Faro:', faroResult.error)
    const faro = buildFaro(Array.isArray(faroResult.data) ? faroResult.data[0] : null)

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
        <div className={styles.page}>
            <ProfileHeader
                userData={profileData}
                stats={stats}
                badge={badge}
                faro={faro}
                favorites={favorites}
                isLoggedIn={isLoggedIn}
                isOwnProfile={isOwnProfile}
            />

            <ChegouCedo songs={vitrine} savers={savers} />

            {/* Acervo no centro; artistas e recados na lateral. No celular a
                lateral se desfaz: artistas antes do acervo, recados no fim. */}
            <div className={`${shellStyles.container} ${styles.body}`}>
                <div className={styles.main}>
                    <SongsList
                        songs={songs}
                        canRemove={isOwnProfile}
                        userData={{
                            display_name: profileData.display_name || profileData.username || '',
                            username: profileData.username || '',
                            avatar_url: profileData.avatar_url,
                        }}
                    />
                </div>

                <div className={styles.rail}>
                    {artists.length >= 3 && (
                        <div className={styles.artists}>
                            <ArtistasDoAcervo artists={artists} />
                        </div>
                    )}
                    <div className={styles.recados}>
                        <Recados
                            profileId={userData.id}
                            currentUserId={currentUserId}
                            initialComments={recados.comments}
                            total={recados.total}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
