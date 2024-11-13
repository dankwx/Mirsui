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
import FollowButton from '@/components/Profile/FollowButton'
import { createClient } from '@/utils/supabase/server'

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
    const isLoggedIn = !!authData.user;
    const isOwnProfile = authData.user?.id === userData.id

    const artists = await fetchArtists(userData.id)
    const songs = await fetchSongs(userData.id)
    const channels = await fetchChannels(userData.id)
    const followers = await fetchFollowers(userData.id)
    const following = await fetchFollowing(userData.id)

    const totalSavedSongs = songs.length
    const totalSavedYouTubeChannels = channels.length
    const totalSavedSpotifyArtists = artists.length
    const totalFollowers = followers.length
    const totalFollowing = following.length

    const supabase = createClient()

    const {
        data: { session },
      } = await supabase.auth.getSession()
    
      let followingData = null
      let followersData = null
      let achievmentData = null
      if (session) {
          const { data: followingResult, error: followingError } = await supabase.rpc('get_user_following', {
              user_uuid: userData.id,
          })
      
          const { data: followersResult, error: followersError } = await supabase.rpc('get_user_followers', {
              user_uuid: userData.id,
          })

          const {data: achievmentResult, error: achievmentError} = await supabase.rpc('get_user_achievements', {
            user_uuid: userData.id,
          })
      
          if (followingError) {
              console.error('Error fetching following:', followingError)
          } else {
              followingData = followingResult
          }
      
          if (followersError) {
              console.error('Error fetching followers:', followersError)
          } else {
              followersData = followersResult
          }

          if (achievmentError) {
            console.error('Error fetching achievments', achievmentError)
          }else {
            achievmentData = achievmentResult
          }
      

    console.log("testeeee",userData.id)
    console.log("testeeee",followersData)
    console.log("achievmts:",achievmentData)


    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="ml-20 flex w-full flex-col px-6 font-sans">
                        <div className="flex">
                            <ProfileDetails
                                isLoggedIn={isLoggedIn}
                                userData={userData}
                                isOwnProfile={isOwnProfile}
                                totalFollowers={followersData}
                                totalFollowing={followingData}
                                userAchievments={achievmentData}
                                followingId={userData.id}
                            />
                        </div>
                        <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
                            <main className="py-8">
                                <CardsSection
                                    totalSavedSongs={totalSavedSongs}
                                    totalSavedYouTubeChannels={
                                        totalSavedYouTubeChannels
                                    }
                                    totalSavedSpotifyArtists={
                                        totalSavedSpotifyArtists
                                    }
                                    totalFollowers={followersData}
                                    totalFollowing={followingData}
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
}