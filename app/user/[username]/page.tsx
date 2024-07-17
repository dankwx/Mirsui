import { notFound } from 'next/navigation'

import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import ProfileDetails from '@/components/ProfileDetails'
import CardsSection from '@/components/CardsSection'
import TabsSection from '@/components/TabsSection'
import SavedArtists from '@/components/SavedArtists'
import { fetchArtists } from '@/utils/fetchArtists'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import ArtistsList from '@/components/ArtistsList'

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
    console.log('Fetched artists:', artists)

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="flex flex-col font-sans">
                        <ProfileDetails
                            userData={userData}
                            isOwnProfile={isOwnProfile}
                        />
                        <div className="flex min-h-screen flex-col bg-background text-foreground">
                            <main className="container flex-1 py-8">
                                <CardsSection />
                                <div className="mt-8">
                                    <TabsSection artists={artists} />
                                </div>
                                <div className="mt-8">
                                    {/* <ArtistsList artists={artists} /> */}
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}