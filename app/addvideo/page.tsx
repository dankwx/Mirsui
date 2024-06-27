'use client'

import React, { useEffect, useState } from 'react'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import firebaseConfig from '../firebase-config'
import { initializeApp } from 'firebase/app'
import Header from '../../components/Header/Header'
import Sidebar from '../../components/Sidebar/Sidebar'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export default function AddVideo() {
    const [loggedUser, setLoggedUser] = useState<unknown | null>(null)
    const [authStateChangedComplete, setAuthStateChangedComplete] =
        useState(false)
    const [videoUrl, setvideoUrl] = useState('')

    const supabase = createClientComponentClient()

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setLoggedUser(user.uid)
                console.log('logado')
            } else {
                setLoggedUser(null)
                console.log('não logado')
            }
            setAuthStateChangedComplete(true) // Marca como completo após a execução
        })

        return () => unsubscribe()
    }, [auth])

    // add video to supabase
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

            // Consulta para contar quantas vezes a video_url já foi inserida
            const { count: videoCount, error: countError } = await supabase
                .from('videos')
                .select('*', { count: 'exact' })
                .eq('video_url', videoUrl)

            if (countError) {
                throw countError
            }

            // A próxima posição será a contagem atual + 1
            const nextPosition = videoCount !== null ? videoCount + 1 : 1

            // Insere o vídeo na tabela 'videos'
            const { data, error } = await supabase.from('videos').insert({
                video_url: videoUrl,
                user_id: user_id,
                position: nextPosition,
            })

            if (error) {
                throw error
            }

            // Limpa o campo de input após a inserção bem-sucedida
            setvideoUrl('')
        } catch (error) {
            console.error('Erro ao reinvidicar vídeo:', error)
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
                            Reinvidicar Video
                        </p>
                        <div className="flex flex-col space-y-2">
                            <input
                                type="text"
                                className="rounded-md border border-gray-300 p-2"
                                value={videoUrl}
                                onChange={(e) => setvideoUrl(e.target.value)}
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
