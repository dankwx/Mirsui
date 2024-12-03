import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FollowersFollowingSection from './UserFollowers'

interface CardsSectionProps {
    totalSavedSongs: number
    totalSavedYouTubeChannels: number
    totalSavedSpotifyArtists: number
    totalFollowers: number
    totalFollowing: number
}

const CardsSection: React.FC<CardsSectionProps> = ({
    totalSavedSongs,
    totalSavedYouTubeChannels,
    totalSavedSpotifyArtists,
    totalFollowers,
    totalFollowing,
}) => {
    return (
        <div className="mb-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="mb-2 text-4xl font-bold">
                        {totalSavedSongs}
                    </div>
                    <div className="text-sm opacity-80">Saved Songs</div>
                </div>
                <div className="text-center">
                    <div className="mb-2 text-4xl font-bold">
                        {totalSavedYouTubeChannels}
                    </div>
                    <div className="text-sm opacity-80">
                        Saved YouTube Channels
                    </div>
                </div>
                <div className="text-center">
                    <div className="mb-2 text-4xl font-bold">
                        {totalSavedSpotifyArtists}
                    </div>
                    <div className="text-sm opacity-80">
                        Saved Spotify Artists
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CardsSection
