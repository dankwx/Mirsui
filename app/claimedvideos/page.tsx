'use client'

import React, { useEffect, useState } from 'react'
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
} from 'firebase/firestore'
import { increment } from 'firebase/firestore'
import Header from '../../components/Header/Header'
import Sidebar from '../../components/Sidebar/Sidebar'
import { getAuth } from 'firebase/auth'
import firebaseConfig from '../firebase-config'
import { initializeApp } from 'firebase/app'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface UserVideo {
    video_url: string
    position: number
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

                //setando o id do usuario
                const user_id = users ? users.id : null
                setUser_id(user_id)

                const { data: userVideosData, error } = await supabase
                    .from('videos')
                    .select('video_url, position')
                    .eq('user_id', user_id) // user_id deve ser obtido anteriormente

                if (error) {
                    throw error
                }
                setUserVideos(userVideosData || [])
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
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="flex flex-col p-4">
                        <p className="mb-4 text-lg font-semibold">
                            videos reinvidicados pelo usuario:{' '}
                            {auth.currentUser?.displayName}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {userVideos.map((video, index) => (
                                <div key={index} className="border p-4">
                                    <p className="mb-2 text-lg font-semibold">
                                        {video.video_url}
                                    </p>
                                    <p className="text-sm">
                                        Position: {video.position}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col space-y-2"></div>
                    </div>
                </div>
            </div>
        </main>
    )
}
