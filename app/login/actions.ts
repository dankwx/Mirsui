'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getSupabaseCookieName } from '@/utils/supabase/cookie-helper'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

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

        // Armazenar o token da sessão nos cookies com os nomes que o Supabase espera
        if (data.session?.access_token) {
            const cookieStore = cookies()
            const cookieName = getSupabaseCookieName()
            
            // Criar o objeto de sessão no formato que o Supabase espera
            const sessionData = JSON.stringify({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_in: data.session.expires_in,
                expires_at: data.session.expires_at,
                token_type: data.session.token_type,
                user: data.user
            })
            
            cookieStore.set(cookieName, sessionData, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 dias
            })
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

        // Armazenar o token da sessão nos cookies se retornar
        if (data.session?.access_token) {
            const cookieStore = cookies()
            const cookieName = getSupabaseCookieName()
            
            // Criar o objeto de sessão no formato que o Supabase espera
            const sessionData = JSON.stringify({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_in: data.session.expires_in,
                expires_at: data.session.expires_at,
                token_type: data.session.token_type,
                user: data.user
            })
            
            cookieStore.set(cookieName, sessionData, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 dias
            })
        }

        revalidatePath('/', 'layout')
        return { success: true, message: data.message }
    } catch (error) {
        console.error('Erro no signup:', error)
        return { error: 'Erro ao conectar com o servidor' }
    }
}
