'use client'

import React, { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import firebaseConfig from '../firebase-config'
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    setDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
} from 'firebase/firestore'
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
} from 'firebase/auth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Register() {
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    const auth = getAuth(app)
    const supabase = createClientComponentClient()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [hide, setHide] = useState(false)
    const [userError, setUserError] = useState(false)
    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)

    // Função para verificar se o username já existe
    const checkUsernameExists = async (username: string) => {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('username', '==', username))
        const querySnapshot = await getDocs(q)
        return !querySnapshot.empty
    }

    const register = async () => {
        try {
            // Verificar se o username já existe
            const usernameExists = await checkUsernameExists(username)
            if (usernameExists) {
                throw new Error(
                    'Username já está em uso. Por favor, escolha outro.'
                )
            }

            // Registrar o usuário
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )
            const user = userCredential.user

            if (user) {
                // Enviar verificação por e-mail
                await sendEmailVerification(user)

                // Atualizar o nome de exibição no perfil
                await updateProfile(user, { displayName: username })

                // Armazenar dados adicionais do usuário no Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    username: username,
                    email: user.email,
                    createdAt: serverTimestamp(),
                })

                // Inserir usuário no Supabase
                const { data, error } = await supabase
                    .from('users')
                    .insert([{ uid: user.uid, email: user.email, username }])

                if (error) {
                    throw new Error(
                        'Erro ao inserir usuário no Supabase: ' + error.message
                    )
                }

                // Definir item no localStorage para autenticação
                localStorage.setItem('authenticated', 'messages')

                // Recarregar a página
                window.location.reload()
            } else {
                throw new Error(
                    'Objeto de usuário não disponível após o registro'
                )
            }
        } catch (error) {
            console.error('Erro ao registrar:', error)
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
