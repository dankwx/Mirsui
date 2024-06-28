'use client'

import React, { useEffect, useState } from 'react'
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
} from 'firebase/firestore'
import Header from '../../components/Header/Header'
import Sidebar from '../../components/Sidebar/Sidebar'
import { getAuth } from 'firebase/auth'
import firebaseConfig from '../firebase-config'
import { initializeApp } from 'firebase/app'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

interface UserVideo {
    video_url: string
    position: number
    title: string
    channelTitle: string
    thumbnailUrl: string
}

export default function ClaimedVideos() {
    const app = initializeApp(firebaseConfig)
    const db = getFirestore()
    const auth = getAuth(app)
    const supabase = createClientComponentClient()

    const [userUsername, setUserUsername] = useState('')
    const [authStateChangedComplete, setAuthStateChangedComplete] =
        useState(false)
    const [loggedUser, setLoggedUser] = useState<unknown | null>(null)
    const [user_id, setUser_id] = useState<string | null>(null) // Estado para armazenar user_id
    const [userVideos, setUserVideos] = useState<UserVideo[]>([])
    const [videoUrl, setVideoUrl] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserUsername(user.uid)
                setLoggedUser(user.uid)
                console.log('logado')
            } else {
                setUserUsername('')
                console.log('não logado')
            }
            setAuthStateChangedComplete(true) // Marca como completo após a execução
        })

        return () => unsubscribe()
    }, [auth])

    const handleAddCollection = async () => {
        console.log('iniciando')
        if (authStateChangedComplete) {
            try {
                setLoggedUser('mFyuIhECSeaFOVxU8P78nPWdfk42')

                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('uid', loggedUser)
                    .single()

                if (usersError) {
                    throw usersError
                }

                // Setando o id do usuário
                const user_id = users ? users.id : null
                setUser_id(user_id)

                const { data: userVideosData, error } = await supabase
                    .from('videos')
                    .select('video_url, position')
                    .eq('user_id', user_id) // user_id deve ser obtido anteriormente

                if (error) {
                    throw error
                }

                // Mapeando os dados dos vídeos para buscar título e thumbnail
                const videosWithDetails: UserVideo[] = []
                for (const video of userVideosData || []) {
                    const videoUrl = video.video_url

                    // Extrair o ID do vídeo do YouTube usando regex ou outra lógica
                    const videoIdRegex =
                        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
                    const match = videoUrl.match(videoIdRegex)

                    if (match && match[1]) {
                        const videoId = match[1]
                        const apiKey = 'AIzaSyBFQKXiPBiluxE3jtWnTvZH3A9K76A8afc'

                        // Fazer requisição para a API do YouTube para obter detalhes do vídeo
                        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
                        const response = await fetch(apiUrl)
                        const data = await response.json()

                        if (data.items && data.items.length > 0) {
                            const snippet = data.items[0].snippet
                            const title = snippet.title
                            const channelTitle = snippet.channelTitle
                            const thumbnailUrl =
                                snippet.thumbnails.maxres?.url ||
                                snippet.thumbnails.high.url ||
                                snippet.thumbnails.medium.url

                            videosWithDetails.push({
                                video_url: videoUrl,
                                position: video.position,
                                title: title,
                                channelTitle: channelTitle,
                                thumbnailUrl: thumbnailUrl,
                            })
                        }
                    }
                }

                setUserVideos(videosWithDetails)
            } catch (error) {
                console.error('Erro ao reinvidicar vídeo:', error)
            }
        }
    }

    useEffect(() => {
        if (authStateChangedComplete) {
            handleAddCollection() // Executa handleAddCollection apenas quando authStateChangedComplete for true
        }
    }, [authStateChangedComplete])

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-sans text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="flex flex-col p-4">
                        <p className="mb-4 text-lg font-semibold">
                            Vídeos reivindicados pelo usuário:{' '}
                            {auth.currentUser?.displayName}
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {/* {userVideos.map((video, index) => (
                                <div key={index} className="border p-4">
                                    <p className="mb-2 text-lg font-semibold">
                                        {video.title}
                                    </p>
                                    <img
                                        src={video.thumbnailUrl}
                                        alt="Thumbnail do vídeo"
                                        className="mb-2"
                                        style={{ maxWidth: '100%' }}
                                    />
                                    <p className="text-sm">
                                        Position: {video.position}
                                    </p>
                                </div>
                            ))} */}
                            {userVideos.map((video, index) => (
                                <Card className="max-w-sm">
                                    <CardHeader>
                                        <Link
                                            href={video.video_url}
                                            target="_blank"
                                        >
                                            <img
                                                src={video.thumbnailUrl}
                                                alt="Thumbnail do vídeo"
                                                className="mb-2"
                                                style={{ maxWidth: '100%' }}
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
                                        <p>Position: {video.position}</p>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                        <div className="flex flex-col space-y-2"></div>
                    </div>
                </div>
            </div>
        </main>
    )
}
