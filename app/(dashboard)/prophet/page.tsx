// app/(dashboard)/prophet/page.tsx
import { redirect } from 'next/navigation'
import { fetchAuthData } from '@/utils/profileService'

export default async function ProphetRedirectPage() {
    const authData = await fetchAuthData()
    
    if (!authData?.user) {
        // Se não estiver logado, redireciona para login
        redirect('/login')
    }

    // Buscar username do usuário logado
    const { createClient } = require('@/utils/supabase/server')
    const supabase = await createClient()
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', authData.user.id)
        .single()

    if (profile?.username) {
        redirect(`/user/${profile.username}/prophet`)
    } else {
        // Se não tem username, redireciona para home
        redirect('/')
    }
}