'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function SignOut() {
    try {
        const accessToken = await getAccessToken()

        // Chamar o backend para invalidar a sessão no Supabase
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
    } catch (error) {
        console.error('Erro no logout:', error)
    }

    // Remover todos os cookies de autenticação, mesmo se o backend falhar
    const cookieStore = cookies()
    cookieStore.getAll().forEach(cookie => {
        if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
            cookieStore.delete(cookie.name)
        }
    })

    revalidatePath('/', 'layout')
    redirect('/')
}
