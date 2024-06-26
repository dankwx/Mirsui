'use client'

import firebaseConfig from '../../app/firebase-config'
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
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
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

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '../ui/button'

const GetAuth = () => {
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const [loggedUser, setLoggedUser] = useState<unknown | null>(null)
    const [authStateChangedComplete, setAuthStateChangedComplete] =
        useState(false)
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [name, setName] = useState('')
    const [paswrd, setPaswrd] = useState('')
    const [hide, setHide] = useState(false)
    const [userError, setUserError] = useState(false)
    const [paswrdError, setPaswrdError] = useState(false)
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

    const login = async () => {
        logout()
        try {
            logout()
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const user = await signInWithEmailAndPassword(
                auth,
                loginEmail,
                loginPassword
            )
            localStorage.setItem('authenticated', 'messages')
            // refrsh page
            window.location.reload()
            // goToHome();
        } catch (error) {
            setUserError(true)
            setPaswrdError(true)
            console.log('(400) Error logging in')
            setHide(true)
        }
    }

    const logout = async () => {
        await signOut(auth)
    }

    return (
        <div className="flex">
            {loggedUser ? (
                <p>{auth.currentUser?.email}</p>
            ) : (
                <Dialog>
                    <DialogTrigger>Log In</DialogTrigger>
                    <DialogContent
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        className="sm:max-w-[425px]"
                    >
                        <DialogHeader>
                            <DialogTitle>Log In</DialogTitle>
                            <DialogDescription>
                                By continuing, you agree to our User Agreement
                                and acknowledge that you understand the Privacy
                                Policy.
                            </DialogDescription>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="name"
                                        className="text-right"
                                    >
                                        Email
                                    </Label>
                                    <Input
                                        id="name"
                                        className="col-span-3"
                                        value={name}
                                        placeholder="email@email.com"
                                        onChange={(event) => {
                                            setName(event.target.value)
                                            setLoginEmail(event.target.value)
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="username"
                                    className="text-right"
                                >
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    className="col-span-3"
                                    type="password"
                                    placeholder="*******"
                                    value={paswrd}
                                    onChange={(event) => {
                                        setPaswrd(event.target.value)
                                        setLoginPassword(event.target.value)
                                    }}
                                />
                            </div>
                            <DialogDescription className="pt-4 text-blue-600">
                                Forgot Password?
                            </DialogDescription>
                            <DialogDescription className="pt-4 text-blue-600">
                                Doesn't Have an account? Register
                            </DialogDescription>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    onClick={(event) => {
                                        login()
                                    }}
                                >
                                    Log In
                                </Button>
                            </DialogFooter>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
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
