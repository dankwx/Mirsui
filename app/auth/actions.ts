'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClientForActions } from '@/utils/supabase/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

/**
 * Grava a sessão retornada pelo backend usando o cliente @supabase/ssr,
 * que escreve os cookies no formato canônico do Supabase — legível tanto
 * pelo servidor (middleware, route handlers) quanto pelo browser client.
 */
async function persistSession(session: {
    access_token: string
    refresh_token: string
}) {
    const supabase = await createClientForActions()
    const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
    })

    if (error) {
        console.error('Erro ao persistir sessão:', error)
        return false
    }
    return true
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            return { error: data.error || 'Erro ao fazer login' }
        }

        if (data.session?.access_token) {
            const ok = await persistSession(data.session)
            if (!ok) {
                return { error: 'Erro ao iniciar sessão. Tente novamente.' }
            }
        }

        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Erro no login:', error)
        return { error: 'Erro ao conectar com o servidor' }
    }
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    try {
        const response = await fetch(`${BACKEND_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, username }),
        })

        const data = await response.json()

        if (!response.ok) {
            return { error: data.error || 'Erro ao criar conta' }
        }

        // O signup pode não retornar sessão (confirmação de email pendente)
        if (data.session?.access_token) {
            await persistSession(data.session)
        }

        revalidatePath('/', 'layout')
        return { success: true, message: data.message }
    } catch (error) {
        console.error('Erro no signup:', error)
        return { error: 'Erro ao conectar com o servidor' }
    }
}

export async function signOut() {
    try {
        const accessToken = await getAccessToken()

        // Chamar o backend para invalidar a sessão no Supabase
        if (accessToken) {
            try {
                await fetch(`${BACKEND_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                })
            } catch (error) {
                console.error('Erro ao chamar backend de logout:', error)
            }
        }
    } catch (error) {
        console.error('Erro no logout:', error)
    }

    // Remover todos os cookies de autenticação, mesmo se o backend falhar
    const cookieStore = cookies()
    cookieStore.getAll().forEach((cookie) => {
        if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
            cookieStore.delete(cookie.name)
        }
    })

    revalidatePath('/', 'layout')
    redirect('/')
}
