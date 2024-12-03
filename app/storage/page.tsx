'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Certifique-se de definir essas variáveis de ambiente no seu .env.local
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ImageUpload() {
    const [user, setUser] = useState<any>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    useEffect(() => {
        // Verificar se já está logado
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            setUser(user)
        }
        checkUser()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            setUser(data.user)
        } catch (error) {
            console.error('Erro no login:', error)
            alert('Falha no login')
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file || !user) return

        try {
            setUploading(true)

            // Gera um nome único para o arquivo
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}_${Math.random().toString(36).substr(2)}.${fileExt}`
            const filePath = `user-profile-images/${user.id}/${fileName}`

            // Faz upload para o Supabase Storage
            const { error } = await supabase.storage
                .from('user-profile-images')
                .upload(filePath, file)

            if (error) throw error

            setUploadSuccess(true)
        } catch (error) {
            console.error('Erro no upload:', error)
            alert('Falha no upload da imagem')
        } finally {
            setUploading(false)
        }
    }

    // Se não estiver logado, mostra tela de login
    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center py-2">
                <form onSubmit={handleLogin} className="w-full max-w-xs">
                    <h2 className="mb-4 text-2xl font-bold">Login</h2>
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded border px-3 py-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded border px-3 py-2"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded bg-blue-500 px-4 py-2 text-white"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        )
    }

    // Tela de upload para usuário autenticado
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-2">
            <h1 className="mb-4 text-2xl font-bold">
                Upload de Imagem de Perfil
            </h1>

            <p className="mb-4">Logado como: {user.email}</p>

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-4"
            />

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="rounded bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                {uploading ? 'Enviando...' : 'Enviar Imagem'}
            </button>

            <button
                onClick={handleLogout}
                className="mt-4 rounded bg-red-500 px-4 py-2 text-white"
            >
                Sair
            </button>

            {uploadSuccess && (
                <p className="mt-4 text-green-500">
                    Upload concluído com sucesso!
                </p>
            )}
        </div>
    )
}
