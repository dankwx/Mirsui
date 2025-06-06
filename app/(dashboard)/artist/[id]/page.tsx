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

// UI Components from shadcn/ui
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    ExternalLink,
} from 'lucide-react'

// Import components
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import SpotifyButton from '@/components/SpotifyButton'
import AlbumExternalLinkButton from '@/components/AlbumExternalLinkButton'

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
                                                      artistInfo.followers.total
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
                                        <Button className="flex items-center gap-2">
                                            <UserPlus className="h-4 w-4" />
                                            {hasUserFollowed
                                                ? 'Seguindo'
                                                : 'Seguir Artista'}
                                        </Button>
                                        <Button variant="outline" size="icon">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                        <SpotifyButton artistUrl={artistUrl} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-4">
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
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="mb-2 text-3xl font-bold text-blue-600">
                                    {artistAlbums.length}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Lançamentos
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Tracks */}
                    {topTracks.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Music className="h-5 w-5" />
                                    Músicas Mais Populares
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {topTracks.slice(0, 5).map((track, index) => (
                                    <div
                                        key={track.id}
                                        className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-6 text-sm font-medium text-gray-500">
                                                {index + 1}
                                            </span>
                                            <div className="relative h-12 w-12">
                                                <Image
                                                    src={
                                                        track.album.images[0]
                                                            ?.url ||
                                                        '/placeholder-album.svg'
                                                    }
                                                    alt={track.album.name}
                                                    fill
                                                    className="rounded object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {track.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {track.album.name} •{' '}
                                                    {formatReleaseDate(
                                                        track.album.release_date
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500">
                                                {formatDuration(
                                                    track.duration_ms
                                                )}
                                            </span>
                                            <Button variant="ghost" size="sm">
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Albums, EPs and Singles Tabs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Disc className="h-5 w-5" />
                                Discografia
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="albums" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger
                                        value="albums"
                                        className="flex items-center gap-2"
                                    >
                                        <Disc className="h-4 w-4" />
                                        Álbuns ({albums.length})
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="singles"
                                        className="flex items-center gap-2"
                                    >
                                        <Music className="h-4 w-4" />
                                        Singles ({singles.length})
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="compilations"
                                        className="flex items-center gap-2"
                                    >
                                        <Award className="h-4 w-4" />
                                        Coletâneas ({compilations.length})
                                    </TabsTrigger>
                                </TabsList>

                                {/* Albums Tab */}
                                <TabsContent value="albums" className="mt-6">
                                    {albums.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {albums.map((album) => (
                                                <Card
                                                    key={album.id}
                                                    className="overflow-hidden transition-shadow hover:shadow-lg"
                                                >
                                                    <div className="relative aspect-square">
                                                        <Image
                                                            src={
                                                                album.images[0]
                                                                    ?.url ||
                                                                '/placeholder-album.svg'
                                                            }
                                                            alt={album.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                                                            <AlbumExternalLinkButton
                                                                url={
                                                                    album
                                                                        .external_urls
                                                                        .spotify
                                                                }
                                                                size="lg"
                                                                className="h-12 w-12 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <h3 className="mb-1 line-clamp-1 font-semibold text-gray-900">
                                                            {album.name}
                                                        </h3>
                                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                                            <span>
                                                                {formatReleaseDate(
                                                                    album.release_date
                                                                )}
                                                            </span>
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {getAlbumTypeLabel(
                                                                    album.album_type
                                                                )}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                                            <Music className="h-3 w-3" />
                                                            {album.total_tracks}{' '}
                                                            faixas
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <Disc className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                            <p>Nenhum álbum encontrado</p>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Singles Tab */}
                                <TabsContent value="singles" className="mt-6">
                                    {singles.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            {singles.map((single) => (
                                                <Card
                                                    key={single.id}
                                                    className="overflow-hidden transition-shadow hover:shadow-lg"
                                                >
                                                    <div className="relative aspect-square">
                                                        <Image
                                                            src={
                                                                single.images[0]
                                                                    ?.url ||
                                                                '/placeholder-album.svg'
                                                            }
                                                            alt={single.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                                                            <AlbumExternalLinkButton
                                                                url={
                                                                    single
                                                                        .external_urls
                                                                        .spotify
                                                                }
                                                                size="sm"
                                                                className="h-10 w-10 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-3">
                                                        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">
                                                            {single.name}
                                                        </h3>
                                                        <div className="text-xs text-gray-500">
                                                            {formatReleaseDate(
                                                                single.release_date
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <Music className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                            <p>Nenhum single encontrado</p>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Compilations Tab */}
                                <TabsContent
                                    value="compilations"
                                    className="mt-6"
                                >
                                    {compilations.length > 0 ? (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {compilations.map((compilation) => (
                                                <Card
                                                    key={compilation.id}
                                                    className="overflow-hidden transition-shadow hover:shadow-lg"
                                                >
                                                    <div className="relative aspect-square">
                                                        <Image
                                                            src={
                                                                compilation
                                                                    .images[0]
                                                                    ?.url ||
                                                                '/placeholder-album.svg'
                                                            }
                                                            alt={
                                                                compilation.name
                                                            }
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                                                            <AlbumExternalLinkButton
                                                                url={
                                                                    compilation
                                                                        .external_urls
                                                                        .spotify
                                                                }
                                                                size="lg"
                                                                className="h-12 w-12 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <h3 className="mb-1 line-clamp-1 font-semibold text-gray-900">
                                                            {compilation.name}
                                                        </h3>
                                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                                            <span>
                                                                {formatReleaseDate(
                                                                    compilation.release_date
                                                                )}
                                                            </span>
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {getAlbumTypeLabel(
                                                                    compilation.album_type
                                                                )}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                                            <Music className="h-3 w-3" />
                                                            {
                                                                compilation.total_tracks
                                                            }{' '}
                                                            faixas
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <Award className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                            <p>Nenhuma coletânea encontrada</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Activity (mantido igual) */}
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
                                    Total de Lançamentos
                                </span>
                                <span className="text-sm font-medium">
                                    {artistAlbums.length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
