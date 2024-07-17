import { createClient } from '@/utils/supabase/server'
import Profile from '@/components/Profile/Profile'
import { updateUsername } from '@/components/Profile/actions'
import { notFound } from 'next/navigation'
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import {
    CircleIcon,
    Music2Icon,
    PlusIcon,
    SearchIcon,
    StarIcon,
} from 'lucide-react'

export default async function ProfilePage({
    params,
}: {
    params: { username: string }
}) {
    const supabase = createClient()

    console.log('Buscando usuário:', params.username)

    // Buscar o usuário pelo username na URL
    const { data: userData, error } = await supabase

        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single()

    console.log('Resultado da busca:', userData, error)

    if (error || !userData) {
        console.log('Usuário não encontrado ou erro:', error)
        notFound()
    }

    const { data: authData } = await supabase.auth.getUser()
    console.log('Dados de autenticação:', authData)
    const isOwnProfile = authData.user?.id === userData.id

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />

                    <div className="flex flex-col font-sans">
                        <Profile
                            username={userData.username}
                            displayName={
                                userData.display_name || userData.username
                            }
                            updateUsernameAction={
                                isOwnProfile ? updateUsername : undefined
                            }
                            isOwnProfile={isOwnProfile}
                        />
                        <div className="flex min-h-screen flex-col bg-background text-foreground">
                            <main className="container flex-1 py-8">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <Card className="bg-muted p-4">
                                        <CardHeader>
                                            <CardTitle>
                                                Total Saved Songs
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-4xl font-bold">
                                                142
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-muted p-4">
                                        <CardHeader>
                                            <CardTitle>
                                                Total Saved YouTube Channels
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-4xl font-bold">
                                                24
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-muted p-4">
                                        <CardHeader>
                                            <CardTitle>
                                                Total Saved Spotify Artists
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-4xl font-bold">
                                                18
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="mt-8">
                                    <Tabs defaultValue="songs">
                                        <TabsList className="mb-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <TabsTrigger value="songs">
                                                    Saved Songs
                                                </TabsTrigger>
                                                <TabsTrigger value="youtube">
                                                    Saved YouTube Channels
                                                </TabsTrigger>
                                                <TabsTrigger value="artists">
                                                    Saved Spotify Artists
                                                </TabsTrigger>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <SearchIcon className="h-4 w-4" />
                                                    <span>Search</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <PlusIcon className="h-4 w-4" />
                                                    <span>Add</span>
                                                </Button>
                                            </div>
                                        </TabsList>
                                        <TabsContent value="songs">
                                            <div className="grid gap-6">
                                                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder.jpeg"
                                                        alt="Album Art"
                                                        width={64}
                                                        height={64}
                                                        className="rounded-md"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-lg font-medium">
                                                            Bohemian Rhapsody
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Queen
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-green-600 bg-background"
                                                            >
                                                                <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                                                Listened before
                                                                it went viral
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-orange-600 bg-background"
                                                            >
                                                                <StarIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                                                Rare find
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder2.jpg"
                                                        alt="Album Art"
                                                        width={64}
                                                        height={64}
                                                        className="rounded-md"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-lg font-medium">
                                                            Stairway to Heaven
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Led Zeppelin
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-green-600 bg-background"
                                                            >
                                                                <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                                                Listened before
                                                                it went viral
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder3.jpeg"
                                                        alt="Album Art"
                                                        width={64}
                                                        height={64}
                                                        className="rounded-md"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-lg font-medium">
                                                            Smells Like Teen
                                                            Spirit
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Nirvana
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-orange-600 bg-background"
                                                            >
                                                                <StarIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                                                Rare find
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder4.webp"
                                                        alt="Album Art"
                                                        width={64}
                                                        height={64}
                                                        className="rounded-md"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-lg font-medium">
                                                            Imagine
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            John Lennon
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-green-600 bg-background"
                                                            >
                                                                <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                                                Listened before
                                                                it went viral
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-orange-600 bg-background"
                                                            >
                                                                <StarIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                                                Rare find
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="youtube">
                                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                                                <div className="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder.svg"
                                                        alt="Channel Thumbnail"
                                                        width={128}
                                                        height={72}
                                                        className="rounded-md"
                                                    />
                                                    <div className="text-center text-sm font-medium">
                                                        Coding Tech
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-green-600 bg-background"
                                                        >
                                                            <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                                            Watched before it
                                                            went viral
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder.svg"
                                                        alt="Channel Thumbnail"
                                                        width={128}
                                                        height={72}
                                                        className="rounded-md"
                                                    />
                                                    <div className="text-center text-sm font-medium">
                                                        Fireship
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-orange-600 bg-background"
                                                        >
                                                            <StarIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                                            Rare find
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder.svg"
                                                        alt="Channel Thumbnail"
                                                        width={128}
                                                        height={72}
                                                        className="rounded-md"
                                                    />
                                                    <div className="text-center text-sm font-medium">
                                                        The Verge
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-green-600 bg-background"
                                                        >
                                                            <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                                            Watched before it
                                                            went viral
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="border-orange-600 bg-background"
                                                        >
                                                            <StarIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                                            Rare find
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-2 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder.svg"
                                                        alt="Channel Thumbnail"
                                                        width={128}
                                                        height={72}
                                                        className="rounded-md"
                                                    />
                                                    <div className="text-center text-sm font-medium">
                                                        Linus Tech Tips
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-orange-600 bg-background"
                                                        >
                                                            <StarIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                                            Rare find
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="artists">
                                            <div className="grid gap-6">
                                                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder.svg"
                                                        alt="Artist Image"
                                                        width={64}
                                                        height={64}
                                                        className="rounded-full"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-lg font-medium">
                                                            Radiohead
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-green-600 bg-background"
                                                            >
                                                                <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                                                Listened before
                                                                they went
                                                                mainstream
                                                            </Badge>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-orange-600 bg-background"
                                                            >
                                                                <StarIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                                                Rare find
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2"
                                                        >
                                                            View Discography
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder.svg"
                                                        alt="Artist Image"
                                                        width={64}
                                                        height={64}
                                                        className="rounded-full"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-lg font-medium">
                                                            Kendrick Lamar
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-green-600 bg-background"
                                                            >
                                                                <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                                                                Listened before
                                                                they went
                                                                mainstream
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2"
                                                        >
                                                            View Discography
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder.svg"
                                                        alt="Artist Image"
                                                        width={64}
                                                        height={64}
                                                        className="rounded-full"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-lg font-medium">
                                                            Taylor Swift
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-orange-600 bg-background"
                                                            >
                                                                <StarIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-orange-300 text-orange-300" />
                                                                Rare find
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2"
                                                        >
                                                            View Discography
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                                                    <img
                                                        src="/placeholder.svg"
                                                        alt="Artist Image"
                                                        width={64}
                                                        height={64}
                                                        className="rounded-full"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-lg font-medium">
                                                            Billie Eilish
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-green-600 bg-background"
                                                            >
                                                                <CircleIcon className="fill-green- h-3 w-3 -translate-x-1 animate-pulse" />
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
