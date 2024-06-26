'use client'

import React, { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import firebaseConfig from '../firebase-config'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
} from 'firebase/auth'

export default function Register() {
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    const auth = getAuth(app)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [hide, setHide] = useState(false)
    const [userError, setUserError] = useState(false)
    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)

    const register = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )
            const user = userCredential.user

            if (user) {
                await sendEmailVerification(user)
                await updateProfile(user, { displayName: username })
                localStorage.setItem('authenticated', 'messages')
                window.location.reload()
            } else {
                throw new Error('User object not available after registration')
            }
        } catch (error) {
            console.error('Error registering:', error)
            setUserError(true)
            setHide(true)
        }
    }

    return (
        <main>
            <div>
                <h3>Register</h3>
                <div>
                    <input
                        type="text"
                        name="username"
                        placeholder="Nome de Usuário"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <p>username</p>
                </div>
                <div>
                    <input
                        type="text"
                        name="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <p>e-mail</p>
                </div>
                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <p>senha</p>
                </div>
                <div>
                    {hide && (
                        <span>
                            Ops, ocorreu um erro durante o registro. Tente
                            novamente!
                        </span>
                    )}
                </div>
                <button onClick={register}>Registrar</button>
                <span>
                    Já possui uma conta?{' '}
                    <span onClick={() => (window.location.href = '/Login')}>
                        Faça o Login
                    </span>
                </span>
            </div>
        </main>
    )
}
