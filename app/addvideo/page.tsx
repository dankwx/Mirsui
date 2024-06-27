'use client'

import React, { useEffect, useState } from 'react'
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import firebaseConfig from '../firebase-config'
import { initializeApp } from 'firebase/app'
import Header from '../../components/Header/Header'
import Sidebar from '../../components/Sidebar/Sidebar'

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export default function AddVideo() {
    const [inputValue, setInputValue] = useState('')
    const [subcollectionItemCount, setSubcollectionItemCount] = useState<
        number | null
    >(null)

    // Função para lidar com a consulta da subcoleção
    const handleCheckSubcollection = async () => {
        try {
            // Monta o caminho para a subcoleção com base no input
            const subcollectionPath = `claimed-videos/${inputValue}/subcolecao1`

            // Cria uma referência para a subcoleção
            const subcollectionRef = collection(db, subcollectionPath)

            // Realiza a consulta para obter todos os documentos na subcoleção
            const querySnapshot = await getDocs(subcollectionRef)

            // Define o estado com o número de documentos encontrados
            setSubcollectionItemCount(querySnapshot.size)

            // Exibe um alerta com a quantidade de documentos
            alert(
                `Quantidade de itens na subcoleção ${inputValue}: ${querySnapshot.size}`
            )
        } catch (error) {
            console.error('Erro ao consultar a subcoleção:', error)
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
                            Verificar Quantia
                        </p>
                        <div className="flex flex-col space-y-2">
                            <input
                                type="text"
                                className="rounded-md border border-gray-300 p-2"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button
                                className="rounded-md bg-blue-500 px-4 py-2 text-white shadow-md hover:bg-blue-600"
                                onClick={handleCheckSubcollection}
                            >
                                Verificar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
