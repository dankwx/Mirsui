'use client'

import React, { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import firebaseConfig from '../firebase-config'
import {
    QueryDocumentSnapshot,
    DocumentData,
    doc,
    getDocs,
} from 'firebase/firestore'
import {
    getFirestore,
    collection,
    query,
    onSnapshot,
    addDoc,
    DocumentReference,
    orderBy,
    deleteDoc,
    QuerySnapshot,
} from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { signOut } from 'firebase/auth'

export default function Login() {
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    const auth = getAuth(app)
    const [loggedUser, setloggedUser] = useState<unknown | null>(null)

    const isAuthenticated = localStorage.getItem('authenticated')
    const [dbCollection, setDbCollection] = useState<string>('messagos')
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [name, setName] = useState('')
    const [paswrd, setPaswrd] = useState('')
    const [hide, setHide] = useState(false)
    const [paswrdIcoPosition, setPaswrdIcoPosition] = useState(true)
    const [userIcoPosition, setUserIcoPosition] = useState(true)
    const [userError, setUserError] = useState(false)
    const [paswrdError, setPaswrdError] = useState(false)

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

    //verifica se esta logado ou nao
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setloggedUser(user.email)
                setDbCollection('messages')
                window.location.href = '/'
            } else {
                setloggedUser(null)
                setDbCollection('messagos')
                // window.location.href = "/";
            }
        })
        return () => unsubscribe()
    }, [])

    //logout
    const logout = async () => {
        await signOut(auth)
    }

    return (
        <main>
            <div>
                <h3>Login</h3>
                <div>
                    <input
                        type="text"
                        name="user"
                        placeholder="Usuário"
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value)
                            setLoginEmail(event.target.value)
                        }}
                        onFocus={() => setUserIcoPosition(false)}
                    />
                    <p>usuario</p>
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Senha"
                        value={paswrd}
                        onChange={(event) => {
                            setPaswrd(event.target.value)
                            setLoginPassword(event.target.value)
                        }}
                        onFocus={() => setPaswrdIcoPosition(false)}
                    />
                    <p>senha</p>
                </div>
                <div>
                    <div>
                        {hide && (
                            <span>
                                Ops, usuário ou senha inválidos. Tente
                                novamente!
                            </span>
                        )}
                    </div>
                </div>

                <button
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onClick={(event) => {
                        login()
                    }}
                >
                    Continuar
                </button>
                <span>
                    Não possui uma conta?{' '}
                    <span onClick={() => (window.location.href = '/Register')}>
                        Efetue o Cadastro
                    </span>
                </span>
            </div>
        </main>
    )
}
