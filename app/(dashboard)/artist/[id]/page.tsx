// app(dashboard)/artist/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { fetchAuthData } from '@/utils/profileService'
import {
    fetchSpotifyArtistInfo,
    fetchSpotifyArtistAlbums,
    fetchSpotifyArtistTopTracks,
    SpotifyArtist,
    SpotifyAlbum,
    SpotifyTrack,
} from '@/utils/spotifyService'

import ArtistHeroSection from '@/components/Artist/ArtistHeroSection'
import ArtistStatsGrid from '@/components/Artist/ArtistStatsGrid'
import ArtistTopTracks from '@/components/Artist/ArtistTopTracks'
import ArtistDiscographyTabs from '@/components/Artist/ArtistDiscographyTabs'
import ArtistRecentFollowers from '@/components/Artist/ArtistRecentFollowers'
import ArtistTopFans from '@/components/Artist/ArtistTopFans'
import ArtistDetailsCard from '@/components/Artist/ArtistDetailsCard'

// Helper function to format duration
function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Helper function to format release date
function formatReleaseDate(dateString: string): string {
    const date = new Date(dateString)
    return date.getFullYear().toString()
}

// Helper function to get album type in Portuguese
function getAlbumTypeLabel(type: string): string {
    switch (type) {
        case 'album':
            return 'Álbum'
        case 'single':
            return 'Single'
        case 'compilation':
            return 'Coletânea'
        default:
            return type
    }
}

export default async function ArtistDetailsPage({
    params,
}: {
    params: { id: string }
}) {
    const { id: artistId } = params

    // Fetch authentication data
    const authData = await fetchAuthData()
    const isLoggedIn = authData?.user ? true : false

    // Fetch Spotify artist information
    let artistInfo: SpotifyArtist | null = null
    let artistAlbums: SpotifyAlbum[] = []
    let topTracks: SpotifyTrack[] = []

    if (artistId) {
        artistInfo = await fetchSpotifyArtistInfo(artistId)
        console.log({ artistInfo })

        if (artistInfo) {
            // Fetch albums and top tracks
            const albumsData = await fetchSpotifyArtistAlbums(artistId)
            artistAlbums = albumsData || []

            const topTracksData = await fetchSpotifyArtistTopTracks(artistId)
            topTracks = topTracksData || []
        }
    }

    // Organize albums by type
    const albums = artistAlbums.filter((album) => album.album_type === 'album')
    const singles = artistAlbums.filter(
        (album) => album.album_type === 'single'
    )
    const compilations = artistAlbums.filter(
        (album) => album.album_type === 'compilation'
    )

    // Get artist image URL
    const artistImageUrl =
        artistInfo?.images?.[0]?.url || '/placeholder-artist.svg'

    // Fetch the total number of follows for this artist (placeholder for now)
    let totalFollows = 142 // Placeholder value

    // Check if current user is already following this artist (placeholder for now)
    let hasUserFollowed = false
    let userFollowDate = null

    // Construct Spotify URL for the artist
    const artistUrl = `https://open.spotify.com/artist/${artistId}`

    // Format follower count
    const formatFollowers = (count: number) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`
        }
        return count.toString()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column - Artist Info */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Hero Section */}
                    <ArtistHeroSection
                        artistInfo={artistInfo}
                        artistImageUrl={artistImageUrl}
                        artistUrl={artistUrl}
                        hasUserFollowed={hasUserFollowed}
                    />
                    {/* Stats Grid */}
                    <ArtistStatsGrid
                        totalFollows={totalFollows}
                        spotifyFollowers={
                            artistInfo?.followers?.total
                                ? formatFollowers(artistInfo.followers.total)
                                : 'N/A'
                        }
                        popularity={artistInfo?.popularity || 'N/A'}
                        totalAlbums={artistAlbums.length}
                    />
                    {/* Top Tracks */}
                    <ArtistTopTracks
                        topTracks={topTracks}
                        formatDuration={formatDuration}
                        formatReleaseDate={formatReleaseDate}
                    />
                    {/* Albums, EPs and Singles Tabs */}
                    <ArtistDiscographyTabs
                        albums={albums}
                        singles={singles}
                        compilations={compilations}
                        formatReleaseDate={formatReleaseDate}
                        getAlbumTypeLabel={getAlbumTypeLabel}
                    />
                </div>

                {/* Right Column - Activity */}
                <div className="space-y-6">
                    <ArtistRecentFollowers />
                    <ArtistTopFans />
                    <ArtistDetailsCard
                        genres={artistInfo?.genres || []}
                        popularity={artistInfo?.popularity || 'N/A'}
                        spotifyFollowers={
                            artistInfo?.followers?.total
                                ? formatFollowers(artistInfo.followers.total)
                                : 'N/A'
                        }
                        totalAlbums={artistAlbums.length}
                        formatFollowers={formatFollowers}
                    />
                </div>
            </div>
        </div>
    )
}
