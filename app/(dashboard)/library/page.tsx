// app/(dashboard)/library/page.tsx
import { redirect } from 'next/navigation'
import { fetchAuthData } from '@/utils/profileService'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Minha Biblioteca - SoundSage',
    description: 'Acesse sua biblioteca musical pessoal no SoundSage.',
}

export default async function LibraryRedirectPage() {
    const authData = await fetchAuthData()
    
    if (!authData?.user) {
        redirect('/login')
    }

    // Buscar username do usuário
    const username = authData.user.user_metadata?.username || authData.user.email
    
    if (!username) {
        redirect('/login')
    }

    // Redirecionar para a biblioteca do usuário
    redirect(`/library/${username}`)
}