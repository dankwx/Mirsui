// app/(dashboard)/library/page.tsx
import { redirect } from 'next/navigation'
import { fetchAuthData } from '@/utils/profileService'

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