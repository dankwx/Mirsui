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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-muted p-4">
                <CardHeader>
                    <CardTitle>Total Saved Songs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{totalSavedSongs}</div>
                </CardContent>
            </Card>
            <Card className="bg-muted p-4">
                <CardHeader>
                    <CardTitle>Total Saved YouTube Channels</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">
                        {totalSavedYouTubeChannels}
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-muted p-4">
                <CardHeader>
                    <CardTitle>Total Saved Spotify Artists</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">
                        {totalSavedSpotifyArtists}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CardsSection
