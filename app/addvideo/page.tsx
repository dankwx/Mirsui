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
import Header from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Sidebar'
import { getAuth } from 'firebase/auth'
import firebaseConfig from '../firebase-config'
import { initializeApp } from 'firebase/app'

export default function AddVideo() {
    const app = initializeApp(firebaseConfig)
    const db = getFirestore()
    const auth = getAuth(app)

    const [collectionName, setCollectionName] = useState('')
    const [userEmail, setUserEmail] = useState<unknown | null>(null)
    const [authStateChangedComplete, setAuthStateChangedComplete] =
        useState(false)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserEmail(user.email)
                console.log('logado')
            } else {
                setUserEmail('')
                console.log('não logado')
            }
            setAuthStateChangedComplete(true) // Marca como completo após a execução
        })

        return () => unsubscribe()
    }, [auth])

    const handleAddCollection = async () => {
        if (authStateChangedComplete) {
            if (collectionName.trim() === '') {
                alert('Por favor, insira um nome para a coleção.')
                return
            }

            const collectionRef = collection(db, collectionName)

            try {
                const subcollectionRef = doc(
                    collectionRef,
                    `${auth.currentUser?.email}`
                )

                const subcollectionSnapshot = await getDoc(subcollectionRef)

                if (subcollectionSnapshot.exists()) {
                    // Subcoleção já existe, então incrementa o campo 'position'
                    await setDoc(
                        subcollectionRef,
                        { position: increment(1) },
                        { merge: true }
                    )
                    alert(
                        `Subcoleção 'hello world' já existente. Incrementando o campo 'position'.`
                    )
                } else {
                    // Subcoleção não existe, então cria com position inicial 1
                    await setDoc(subcollectionRef, { position: 1 })
                    alert(`Subcoleção 'hello world' adicionada com sucesso!`)
                }

                setCollectionName('')
            } catch (error) {
                console.error('Erro ao adicionar/atualizar coleção:', error)
                alert(
                    'Ocorreu um erro ao adicionar/atualizar a coleção. Verifique o console para mais detalhes.'
                )
            }
        }
    }

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <div className="flex flex-col p-4">
                        <p className="mb-4 text-lg font-semibold">
                            Adicionar Coleção com Subcoleção "hello world"
                        </p>
                        <div className="flex flex-col space-y-2">
                            <input
                                type="text"
                                className="rounded-md border border-gray-300 p-2"
                                placeholder="Nome da coleção"
                                value={collectionName}
                                onChange={(e) =>
                                    setCollectionName(e.target.value)
                                }
                            />
                            <button
                                className="rounded-md bg-blue-500 px-4 py-2 text-white shadow-md hover:bg-blue-600"
                                onClick={handleAddCollection}
                            >
                                Adicionar Coleção com Subcoleção
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
