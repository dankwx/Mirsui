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
        <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-1 overflow-hidden">
            {/* Sidebar - recebe userProfile como prop */}
            <Sidebar userProfile={userProfile} />

            {/* Área principal - header + conteúdo */}
            <div className="flex min-h-0 flex-col overflow-hidden">
                {/* Header fixo - também pode receber userProfile se precisar */}
                <Header userProfile={userProfile} />

                {/* Conteúdo com scroll */}
                <main className="flex-1 overflow-y-auto bg-background text-foreground">
                    {children}
                </main>
            </div>
        </div>
    )
}
