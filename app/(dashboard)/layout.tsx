// app/(dashboard)/layout.tsx
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'
import { createClient } from '@/utils/supabase/server'

// Tipo para o perfil do usuário
interface UserProfile {
    id?: string
    email?: string
    username?: string
    description?: string
    display_name?: string
    avatar_url?: string
    rating?: number
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()

    // Buscar dados do usuário no servidor (rápido)
    let userProfile: UserProfile | null = null

    try {
        const { data: authData, error: authError } =
            await supabase.auth.getUser()

        if (!authError && authData?.user) {
            const userId = authData.user.id

            // Buscar informações do perfil na tabela profiles
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (profileError) {
                console.log('Erro ao buscar perfil:', profileError)
                // Se não encontrar o perfil, usar dados básicos do auth
                userProfile = {
                    email: authData.user.email,
                    display_name:
                        authData.user.user_metadata?.full_name || 'User',
                    avatar_url: undefined,
                    username: undefined,
                }
            } else {
                userProfile = profileData
            }
        }
    } catch (error) {
        console.log('Falha ao buscar informações do usuário', error)
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#05030f] text-white">
            {/* Sidebar fixa - recebe userProfile como prop */}
            <Sidebar userProfile={userProfile} />

            {/* Área principal - header + conteúdo com margem para a sidebar */}
            <div className="ml-[280px] flex flex-1 min-h-0 flex-col">
                {/* Header fixo - também pode receber userProfile se precisar */}
                <Header userProfile={userProfile} />

                {/* Conteúdo com scroll */}
                <main className="relative flex-1 overflow-y-auto bg-gradient-to-b from-[#060214] via-[#05030f] to-[#020008]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(9,4,24,0)_100%)]" />
                    <div className="relative h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
