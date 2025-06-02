import { createClient } from '@/utils/supabase/server'
import { fetchAuthData } from '@/utils/profileService'
import { fetchSpotifyArtistInfo, SpotifyArtist } from '@/utils/spotifyService'
// import { countArtistOccurrences } from '@/utils/fetchArtistInfo'

// UI Components from shadcn/ui
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
    Heart,
    Play,
    Share2,
    TrendingUp,
    Users,
    Clock,
    Calendar,
    Music,
    Award,
    Star,
    Mic,
    Disc,
    UserPlus,
} from 'lucide-react'

// Import components
// import FollowArtistButton from '@/components/FollowArtistButton/FollowArtistButton'
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'

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
    if (artistId) {
        artistInfo = await fetchSpotifyArtistInfo(artistId)
        console.log({ artistInfo })
    }

    // Get artist image URL
    const artistImageUrl =
        artistInfo?.images?.[0]?.url || '/placeholder-artist.svg'

    // Fetch the total number of follows for this artist (placeholder for now)
    let totalFollows = 142 // Placeholder value
    // if (artistInfo?.uri) {
    //     totalFollows = await countArtistOccurrences(artistInfo.uri)
    // }

    // Check if current user is already following this artist (placeholder for now)
    let hasUserFollowed = false
    let userFollowDate = null

    // Placeholder logic - would be implemented later
    // if (isLoggedIn && artistInfo?.uri) {
    //     const supabase = createClient()
    //     const { data: userFollow, error } = await supabase
    //         .from('artist_follows')
    //         .select('created_at')
    //         .eq('user_id', authData.user?.id)
    //         .eq('artist_uri', artistInfo.uri)
    //         .single()

    //     if (!error && userFollow) {
    //         hasUserFollowed = true
    //         userFollowDate = userFollow.created_at
    //     }
    // }

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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            {/* Header */}
            <Header />
            <Sidebar />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column - Artist Info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Hero Section */}
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="relative h-80 w-full md:w-80">
                                        <Image
                                            src={artistImageUrl}
                                            alt={`Foto do artista ${
                                                artistInfo?.name || 'Artista'
                                            }`}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                                            <Button
                                                size="lg"
                                                className="h-16 w-16 rounded-full"
                                            >
                                                <Play className="h-6 w-6" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4 p-6">
                                        <div>
                                            <Badge
                                                variant="secondary"
                                                className="mb-2"
                                            >
                                                <Mic className="mr-1 h-3 w-3" />
                                                Artista Verificado
                                            </Badge>
                                            <h1 className="mb-2 text-3xl font-bold text-gray-900">
                                                {artistInfo?.name ||
                                                    'Artista Desconhecido'}
                                            </h1>
                                            <div className="mb-4 flex flex-wrap gap-2">
                                                {artistInfo?.genres
                                                    ?.slice(0, 3)
                                                    .map((genre, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="outline"
                                                        >
                                                            {genre}
                                                        </Badge>
                                                    ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {artistInfo?.followers?.total
                                                    ? formatFollowers(
                                                          artistInfo.followers
                                                              .total
                                                      )
                                                    : 'N/A'}{' '}
                                                seguidores
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="h-4 w-4" />
                                                {artistInfo?.popularity ||
                                                    'N/A'}{' '}
                                                popularidade
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            {/* Placeholder Follow Button */}
                                            <Button className="flex items-center gap-2">
                                                <UserPlus className="h-4 w-4" />
                                                {hasUserFollowed
                                                    ? 'Seguindo'
                                                    : 'Seguir Artista'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                            >
                                                <Share2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="mb-2 text-3xl font-bold text-purple-600">
                                        {totalFollows}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Seguidores na Plataforma
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="mb-2 text-3xl font-bold text-green-600">
                                        {artistInfo?.followers?.total
                                            ? formatFollowers(
                                                  artistInfo.followers.total
                                              )
                                            : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Seguidores Spotify
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="mb-2 text-3xl font-bold text-orange-600">
                                        {artistInfo?.popularity || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Popularidade Global
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Popularity Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Métricas de Popularidade
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Popularidade Spotify</span>
                                        <span>
                                            {artistInfo?.popularity || 'N/A'}
                                            /100
                                        </span>
                                    </div>
                                    <Progress
                                        value={artistInfo?.popularity || 0}
                                        className="h-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>
                                            Novos seguidores esta semana
                                        </span>
                                        <span>247</span>
                                    </div>
                                    <Progress value={82} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Crescimento mensal</span>
                                        <span>+18%</span>
                                    </div>
                                    <Progress value={72} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Tracks */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Music className="h-5 w-5" />
                                    Músicas Mais Populares
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* This would be populated with actual top tracks from Spotify API */}
                                {[
                                    { name: 'Hit Song #1', plays: '1.2B' },
                                    { name: 'Popular Track', plays: '890M' },
                                    { name: 'Fan Favorite', plays: '652M' },
                                    { name: 'Chart Topper', plays: '543M' },
                                    { name: 'Latest Single', plays: '321M' },
                                ].map((track, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-4 text-sm font-medium text-gray-500">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium">
                                                    {track.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {track.plays} reproduções
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Activity */}
                    <div className="space-y-6">
                        {/* Recent Followers */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Seguidores Recentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    {
                                        name: 'Ana Silva',
                                        time: '5 min atrás',
                                        avatar: 'AS',
                                    },
                                    {
                                        name: 'Carlos Santos',
                                        time: '20 min atrás',
                                        avatar: 'CS',
                                    },
                                    {
                                        name: 'Maria Oliveira',
                                        time: '1 hora atrás',
                                        avatar: 'MO',
                                    },
                                    {
                                        name: 'João Pedro',
                                        time: '2 horas atrás',
                                        avatar: 'JP',
                                    },
                                    {
                                        name: 'Lucia Costa',
                                        time: '4 horas atrás',
                                        avatar: 'LC',
                                    },
                                ].map((user, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={`/placeholder-user.jpg`}
                                            />
                                            <AvatarFallback className="text-xs">
                                                {user.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {user.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Top Fans */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Maiores Fãs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    {
                                        name: 'MusicFan2024',
                                        follows: 156,
                                        rank: 1,
                                    },
                                    {
                                        name: 'ArtistLover',
                                        follows: 134,
                                        rank: 2,
                                    },
                                    {
                                        name: 'SoundExplorer',
                                        follows: 98,
                                        rank: 3,
                                    },
                                ].map((user, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                                user.rank === 1
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : user.rank === 2
                                                      ? 'bg-gray-100 text-gray-800'
                                                      : 'bg-orange-100 text-orange-800'
                                            }`}
                                        >
                                            {user.rank}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {user.follows} artistas seguidos
                                            </p>
                                        </div>
                                        {user.rank === 1 && (
                                            <Star className="h-4 w-4 text-yellow-500" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Artist Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalhes do Artista</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        Gêneros
                                    </span>
                                    <span className="text-right text-sm font-medium">
                                        {artistInfo?.genres
                                            ?.slice(0, 2)
                                            .join(', ') || 'N/A'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        Popularidade
                                    </span>
                                    <span className="text-sm font-medium">
                                        {artistInfo?.popularity || 'N/A'}/100
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        Seguidores Spotify
                                    </span>
                                    <span className="text-sm font-medium">
                                        {artistInfo?.followers?.total
                                            ? formatFollowers(
                                                  artistInfo.followers.total
                                              )
                                            : 'N/A'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        Verificado
                                    </span>
                                    <span className="text-sm font-medium">
                                        {artistInfo ? 'Sim' : 'N/A'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Albums */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Disc className="h-5 w-5" />
                                    Álbuns Recentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* This would be populated with actual albums from Spotify API */}
                                {[
                                    {
                                        name: 'Latest Album',
                                        year: '2024',
                                        type: 'Album',
                                    },
                                    {
                                        name: 'Hit Singles',
                                        year: '2023',
                                        type: 'Single',
                                    },
                                    {
                                        name: 'Greatest Hits',
                                        year: '2022',
                                        type: 'Compilation',
                                    },
                                ].map((album, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                                            <Disc className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {album.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {album.type} • {album.year}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
