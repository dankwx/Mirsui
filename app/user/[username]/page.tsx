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

export default async function ProfilePage({
    params,
}: {
    params: { username: string }
}) {
    console.log('Buscando usuário:', params.username)

    const { userData, error } = await fetchUserData(params.username)

    if (error || !userData) {
        console.log('Usuário não encontrado ou erro:', error)
        notFound()
    }

    const authData = await fetchAuthData()
    const isOwnProfile = authData.user?.id === userData.id

    const artists = await fetchArtists(userData.id)
    const songs = await fetchSongs(userData.id)
    const channels = await fetchChannels(userData.id)

    const totalSavedSongs = songs.length
    const totalSavedYouTubeChannels = channels.length
    const totalSavedSpotifyArtists = artists.length

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="flex w-full flex-col font-sans ml-20">
                        <ProfileDetails
                            userData={userData}
                            isOwnProfile={isOwnProfile}
                        />
                        <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
                            <main className="container flex-1 py-8">
                                <CardsSection
                                    totalSavedSongs={totalSavedSongs}
                                    totalSavedYouTubeChannels={
                                        totalSavedYouTubeChannels
                                    }
                                    totalSavedSpotifyArtists={
                                        totalSavedSpotifyArtists
                                    }
                                />
                                <div className="mt-8 w-full">
                                    <TabsSection
                                        artists={artists}
                                        songs={songs}
                                        channels={channels}
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
