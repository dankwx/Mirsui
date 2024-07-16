import { createClient } from '@/utils/supabase/server'
import Profile from '@/components/Profile/Profile'
import { updateUsername } from '@/components/Profile/actions'
import { notFound } from 'next/navigation'
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'

export default async function ProfilePage({
    params,
}: {
    params: { username: string }
}) {
    const supabase = createClient()

    console.log('Buscando usuário:', params.username)

    // Buscar o usuário pelo username na URL
    const { data: userData, error } = await supabase

        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single()

    console.log('Resultado da busca:', userData, error)

    if (error || !userData) {
        console.log('Usuário não encontrado ou erro:', error)
        notFound()
    }

    const { data: authData } = await supabase.auth.getUser()
    console.log('Dados de autenticação:', authData)
    const isOwnProfile = authData.user?.id === userData.id

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-h-full w-full flex-1 flex-col justify-between font-mono text-sm">
                <div className="flex h-full flex-1">
                    <Sidebar />
                    <Profile
                        username={userData.username}
                        displayName={userData.display_name || userData.username}
                        updateUsernameAction={
                            isOwnProfile ? updateUsername : undefined
                        }
                        isOwnProfile={isOwnProfile}
                    />
                </div>
            </div>
        </main>
    )
}
