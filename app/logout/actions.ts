'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSupabaseCookieName } from '@/utils/supabase/cookie-helper'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function SignOut() {
    try {
        const cookieStore = cookies()
        const cookieName = getSupabaseCookieName()
        
        // Pegar o token do cookie
        const cookieValue = cookieStore.get(cookieName)?.value
        let accessToken = null
        
        if (cookieValue) {
            try {
                const session = JSON.parse(cookieValue)
                accessToken = session.access_token
            } catch (e) {
                console.error('Erro ao parsear cookie:', e)
            }
        }

        // Chamar o backend para fazer logout (backend gerencia o logout no Supabase)
        if (accessToken) {
            try {
                await fetch(`${BACKEND_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                })
            } catch (error) {
                console.error('Erro ao chamar backend de logout:', error)
            }
        }

        // Remover todos os cookies relacionados à autenticação
        const allCookies = cookieStore.getAll()
        allCookies.forEach(cookie => {
            if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
                cookieStore.delete(cookie.name)
            }
        })

        // Revalidar todas as páginas para limpar o cache
        revalidatePath('/', 'layout')

    } catch (error) {
        console.error('Erro no logout:', error)
        // Mesmo com erro, tenta remover os cookies
        try {
            const cookieStore = cookies()
            const allCookies = cookieStore.getAll()
            allCookies.forEach(cookie => {
                if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
                    cookieStore.delete(cookie.name)
                }
            })
        } catch (e) {
            console.error('Erro ao deletar cookies:', e)
        }
    }
    
    // Redirecionar para a home após logout
    redirect('/')
}
