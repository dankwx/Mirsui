'use client'

import { useEffect, useState } from 'react'
import Header from '../../components/Header/Header'
import Sidebar from '../../components/Sidebar/Sidebar'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import firebaseConfig from '../firebase-config'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export interface UserVideo {
    video_url: string
    video_title: string
    subscribers_count: number
    views_count: number
    video_thumbnail: string
    channel_name: string
    position: number
    claimedat: Date
}

const NewAddVideo = () => {
    const [loggedUser, setLoggedUser] = useState<string | null>(null)
    const [authStateChangedComplete, setAuthStateChangedComplete] =
        useState(false)
    const [videoUrl, setVideoUrl] = useState('')
    const supabase = createClientComponentClient()

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setLoggedUser(user.uid)
                console.log('Usuário logado')
            } else {
                setLoggedUser(null)
                console.log('Usuário não logado')
            }
            setAuthStateChangedComplete(true)
        })

        return () => unsubscribe()
    }, [auth])

    const handleClaimVideo = async () => {
        if (!loggedUser) {
            console.log('Usuário não autenticado.')
            return
        }

        try {
            if (!loggedUser) {
                throw new Error('UID do usuário não encontrado.')
            }

            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id')
                .eq('uid', loggedUser)
                .single()

            if (usersError) {
                throw usersError
            }
            const user_id = users ? users.id : null

            // Extrair o ID do vídeo do URL do YouTube
            const videoIdRegex =
                /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
            const match = videoUrl.match(videoIdRegex)

            if (!match || !match[1]) {
                throw new Error('URL do YouTube inválida.')
            }

            const videoId = match[1]
            const apiKey = `${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!}`
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics`

            // Consulta à API do YouTube
            const response = await fetch(apiUrl)
            const data = await response.json()

            if (data.items && data.items.length === 0) {
                throw new Error('Vídeo não encontrado.')
            }

            const snippet = data.items[0].snippet
            const statistics = data.items[0].statistics
            

            // Consulta para contar quantas vezes a video_url já foi inserida
            const { count: videoCount, error: countError } = await supabase
                .from('videosnew')
                .select('*', { count: 'exact' })
                .eq('video_url', videoUrl)

            if (countError) {
                throw countError
            }

            // A próxima posição será a contagem atual + 1
            const nextPosition = videoCount !== null ? videoCount + 1 : 1

            // Construir objeto UserVideo
            const newVideo: UserVideo = {
                video_url: videoUrl,
                video_title: snippet.title,
                subscribers_count: await fetchChannelSubscribers(
                    snippet.channelId,
                    apiKey
                ),
                views_count: parseInt(statistics.viewCount),
                video_thumbnail:
                    snippet.thumbnails.maxres.url ||
                    snippet.thumbnails.high.url ||
                    snippet.thumbnails.medium.url ||
                    snippet.thumbnails.default.url,
                channel_name: snippet.channelTitle,
                position: nextPosition, // A posição inicial será sempre 1 para um novo vídeo
                claimedat: new Date(),
            }

            // Inserir no banco de dados Supabase
            const { data: insertedVideo, error } = await supabase
                .from('videosnew')
                .insert([
                    {
                        video_url: newVideo.video_url,
                        video_title: newVideo.video_title,
                        subscribers_count: newVideo.subscribers_count,
                        views_count: newVideo.views_count,
                        video_thumbnail: newVideo.video_thumbnail,
                        channel_name: newVideo.channel_name,
                        user_id: user_id,
                        position: newVideo.position,
                        claimedat: newVideo.claimedat
                            .toISOString()
                            .slice(0, 19)
                            .replace('T', ' '), // Formato YYYY-MM-DD HH:mm:ss
                    },
                ])

            if (error) {
                throw error
            }

            console.log('Vídeo reinvidicado com sucesso:', insertedVideo)
            setVideoUrl('') // Limpar campo de input após inserção bem-sucedida
        } catch (error) {
            console.error('Erro ao reinvidicar vídeo:', error)
        }
    }

    const fetchChannelSubscribers = async (
        channelId: string,
        apiKey: string
    ): Promise<number> => {
        try {
            const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
            const response = await fetch(apiUrl)
            const data = await response.json()

            if (data.items && data.items.length > 0) {
                const statistics = data.items[0].statistics
                return parseInt(statistics.subscriberCount)
            } else {
                return 0
            }
        } catch (error) {
            console.error('Erro ao obter número de inscritos do canal:', error)
            return 0
        }
    }

    if (!authStateChangedComplete) {
        return null // Ou algum indicador de carregamento, se necessário
    }

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="flex flex-col p-4">
                        <p className="mb-4 text-lg font-semibold">
                            Salvar vídeo
                        </p>
                        <div className="flex flex-col space-y-2">
                            <input
                                type="text"
                                className="rounded-md border border-gray-300 p-2"
                                placeholder="Insira a URL do vídeo do YouTube"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                            />
                            <button
                                onClick={handleClaimVideo}
                                className="rounded-md bg-blue-500 px-4 py-2 text-white shadow-md hover:bg-blue-600"
                            >
                                Reinvidicar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default NewAddVideo
