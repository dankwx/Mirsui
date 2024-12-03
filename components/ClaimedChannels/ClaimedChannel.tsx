'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UserVideo {
    video_url: string
    position: number
    title: string
    channelTitle: string
    channelSubs: number
    thumbnailUrl: string
    viewCount: number
    claimedAt: Date | null
}

export default function ClaimedChannel({
    params,
    searchParams,
}: {
    params: { slug: string }
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const [loggedUser, setLoggedUser] = useState<string | null>(null)
    const [authStateChangedComplete, setAuthStateChangedComplete] =
        useState(false)
    const [channelInput, setChannelInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [userIds, setUserIds] = useState<string[]>([])
    const [error, setError] = useState('')
    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const [userUsername, setUserUsername] = useState('')
    const [user_id, setUser_id] = useState<string | null>(null)
    const [userVideos, setUserVideos] = useState<UserVideo[]>([])
    const [loadingVideos, setLoadingVideos] = useState(true) // Estado para controlar o carregamento dos vídeos

    const supabase = createClient()

    useEffect(() => {
        fetchChannelInfo()
    }, [])

    //fetch o usuario atual logado
    const fetchChannelInfo = async () => {
        try {
            const { data, error } = await supabase.auth.getUser()
            const username = data.user?.user_metadata?.username

            if (error) {
                throw error
            }

            if (data) {
                setUserIds(username)
                setLoggedUser(username)
                console.log(username)
            }
        } catch (error) {
            console.log('nao deu pra fazer fetch de usuario', error)
        } finally {
            setIsAuthChecked(true)
        }
    }

    const handleAddCollection = async () => {
        console.log('iniciando')
        if (isAuthChecked) {
            try {
                const { data: users, error: usersError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('username', params.slug)
                    .single()

                if (usersError) {
                    throw usersError
                }

                const user_id = users ? users.id : null
                setUser_id(params.slug)

                const { data: userVideosData, error } = await supabase
                    .from('videos')
                    .select(
                        'video_url, position, video_title, channel_name, subscribers_count, video_thumbnail, views_count, claimedat'
                    )
                    .eq('user_id', user_id)
                    .order('claimedat', { ascending: false })
                if (error) {
                    throw error
                }

                const videosWithDetails: UserVideo[] = userVideosData.map(
                    (video) => ({
                        video_url: video.video_url,
                        position: video.position,
                        title: video.video_title,
                        channelTitle: video.channel_name,
                        channelSubs: video.subscribers_count,
                        thumbnailUrl: video.video_thumbnail,
                        viewCount: video.views_count,
                        claimedAt: video.claimedat
                            ? new Date(video.claimedat)
                            : null,
                    })
                )

                setUserVideos(videosWithDetails)
                setLoadingVideos(false) // Quando os vídeos são carregados, definimos o estado para false
            } catch (error) {
                console.error('Erro ao reinvidicar vídeo:', error)
            }
        }
    }

    const handleDeleteVideo = async (videoUrl: string) => {
        try {
            const { error } = await supabase
                .from('videos')
                .delete()
                .eq('video_url', videoUrl)

            if (error) {
                throw error
            }

            // Atualizar a lista de vídeos após a exclusão
            await handleAddCollection()
        } catch (error) {
            console.error('Erro ao deletar vídeo:', error)
        }
    }

    useEffect(() => {
        if (isAuthChecked) {
            handleAddCollection()
        }
    }, [isAuthChecked])

    return (
        <main>
            <div className="flex flex-col">
                <div className="flex min-h-full w-full flex-1 flex-col justify-between font-sans text-sm">
                    <div className="flex h-full flex-1">
                        <div className="flex flex-col p-4">
                            <p className="mb-4 text-lg font-semibold">
                                Vídeos reivindicados por: {params.slug}
                            </p>
                            <div className="grid grid-cols-4 gap-4">
                                {loadingVideos ? (
                                    <>
                                        <div className="flex flex-col space-y-3">
                                            <Skeleton className="h-[125px] w-[280px] rounded-xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[250px]" />
                                                <Skeleton className="h-4 w-[200px]" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-3">
                                            <Skeleton className="h-[125px] w-[280px] rounded-xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[250px]" />
                                                <Skeleton className="h-4 w-[200px]" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-3">
                                            <Skeleton className="h-[125px] w-[280px] rounded-xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[250px]" />
                                                <Skeleton className="h-4 w-[200px]" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-3">
                                            <Skeleton className="h-[125px] w-[280px] rounded-xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[250px]" />
                                                <Skeleton className="h-4 w-[200px]" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-3">
                                            <Skeleton className="h-[125px] w-[280px] rounded-xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[250px]" />
                                                <Skeleton className="h-4 w-[200px]" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    userVideos.map((video, index) => (
                                        <Card
                                            key={index}
                                            className="group relative max-w-72"
                                        >
                                            <CardHeader>
                                                {params.slug == loggedUser ? (
                                                    <Dialog>
                                                        <DialogTrigger>
                                                            <div
                                                                className="absolute right-5 top-5 z-10 bg-white p-2 opacity-0 transition-all duration-300 hover:cursor-pointer hover:bg-red-400 hover:text-white group-hover:opacity-100"
                                                                // onClick={() => {
                                                                //     handleDeleteVideo(
                                                                //         video.video_url
                                                                //     )
                                                                // }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="18"
                                                                    height="18"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    stroke-width="2"
                                                                    stroke-linecap="round"
                                                                    stroke-linejoin="round"
                                                                    className="lucide lucide-trash-2"
                                                                >
                                                                    <path d="M3 6h18" />
                                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                                    <line
                                                                        x1="10"
                                                                        x2="10"
                                                                        y1="11"
                                                                        y2="17"
                                                                    />
                                                                    <line
                                                                        x1="14"
                                                                        x2="14"
                                                                        y1="11"
                                                                        y2="17"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Are you
                                                                    sure?
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    This action
                                                                    cannot be
                                                                    undone.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter>
                                                                <DialogClose
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        type="button"
                                                                        variant={
                                                                            'destructive'
                                                                        }
                                                                        onClick={() =>
                                                                            handleDeleteVideo(
                                                                                video.video_url
                                                                            )
                                                                        }
                                                                    >
                                                                        Confirm
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                ) : null}

                                                <Link
                                                    href={video.video_url}
                                                    target="_blank"
                                                    className="relative block"
                                                >
                                                    <img
                                                        src={video.thumbnailUrl}
                                                        alt="Thumbnail do vídeo"
                                                        className="mb-2"
                                                        style={{
                                                            maxWidth: 'auto',
                                                            height: 'auto',
                                                        }}
                                                        loading="lazy"
                                                    />
                                                </Link>
                                                <CardTitle className="text-md">
                                                    <Link
                                                        href={video.video_url}
                                                        target="_blank"
                                                    >
                                                        {video.title}
                                                    </Link>
                                                </CardTitle>
                                                <CardDescription className="text-sm">
                                                    {video.channelTitle}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardFooter>
                                                <p>Subs: {video.channelSubs}</p>
                                                <p>
                                                    Views:{' '}
                                                    <strong className="text-green-500">
                                                        {video.viewCount}
                                                    </strong>
                                                </p>
                                                <p>
                                                    Position: {video.position}
                                                </p>
                                                <p>
                                                    Claimed:{' '}
                                                    {video.claimedAt
                                                        ? new Date(
                                                              video.claimedAt
                                                          ).toLocaleDateString()
                                                        : 'Not claimed'}
                                                </p>
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}
                            </div>
                            <div className="flex flex-col space-y-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
