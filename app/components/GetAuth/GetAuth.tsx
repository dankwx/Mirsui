'use client'

import firebaseConfig from '../../firebase-config'
import { initializeApp } from 'firebase/app'
import {
    QueryDocumentSnapshot,
    DocumentData,
    doc,
    getDocs,
    getFirestore,
    collection,
    query,
    onSnapshot,
    addDoc,
    DocumentReference,
    orderBy,
    deleteDoc,
    QuerySnapshot,
    Timestamp,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

import Link from 'next/link'

const GetAuth = () => {
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    const auth = getAuth(app)
    const [loggedUser, setLoggedUser] = useState<unknown | null>(null)
    const [authStateChangedComplete, setAuthStateChangedComplete] =
        useState(false)
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setLoggedUser(user.email)
                console.log('logado')
            } else {
                setLoggedUser(null)
                console.log('não logado')
            }
            setAuthStateChangedComplete(true) // Marca como completo após a execução
        })

        return () => unsubscribe()
    }, [auth])

    const logout = async () => {
        await signOut(auth)
    }

    return (
        <div className="flex">
            {loggedUser ? (
                <p>{auth.currentUser?.email}</p>
            ) : (
                <p onClick={() => router.push('/login')}>Login</p>
            )}
            <DropdownMenu>
                <DropdownMenuTrigger className="ml-2">
                    {loggedUser ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            className="lucide lucide-chevron-down"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    ) : (
                        <p></p>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Link href="/registerusername">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={logout}
                    >
                        Log Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default GetAuth
