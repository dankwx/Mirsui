'use server'

import { cookies } from 'next/headers'
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

        // Chamar o backend para fazer logout
        if (accessToken) {
            await fetch(`${BACKEND_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            })
        }

        // Remover o cookie
        cookieStore.delete(cookieName)

    } catch (error) {
        console.error('Erro no logout:', error)
        // Mesmo com erro, remove o cookie local
        cookies().delete(getSupabaseCookieName())
    }
}
