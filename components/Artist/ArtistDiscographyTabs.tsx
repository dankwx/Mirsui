import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Disc, Music, Award } from 'lucide-react'
import AlbumExternalLinkButton from '@/components/AlbumExternalLinkButton'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { formatReleaseDate, getAlbumTypeLabel } from '@/lib/formatters'

interface ArtistDiscographyTabsProps {
    albums: any[]
    singles: any[]
    compilations: any[]
}

export default function ArtistDiscographyTabs({
    albums,
    singles,
    compilations,
}: ArtistDiscographyTabsProps) {
    return (
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
                                                    album.images[0]?.url ||
                                                    '/placeholder-album.svg'
                                                }
                                                alt={album.name}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                                                <AlbumExternalLinkButton
                                                    url={
                                                        album.external_urls
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
                                                {album.total_tracks} faixas
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
                                                    single.images[0]?.url ||
                                                    '/placeholder-album.svg'
                                                }
                                                alt={single.name}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                                                <AlbumExternalLinkButton
                                                    url={
                                                        single.external_urls
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
                    <TabsContent value="compilations" className="mt-6">
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
                                                    compilation.images[0]
                                                        ?.url ||
                                                    '/placeholder-album.svg'
                                                }
                                                alt={compilation.name}
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
                                                {compilation.total_tracks}{' '}
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
    )
}
