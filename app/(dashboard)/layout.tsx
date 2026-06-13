// app/(dashboard)/layout.tsx
import Header from '@/components/Header/Header'
import { createClient } from '@/utils/supabase/server'
import { AuthProvider } from '@/components/AuthProvider/AuthProvider'

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
    const supabase = await createClient()

    // Buscar dados do usuário no servidor (rápido)
    let userProfile: UserProfile | null = null

    try {
        const { data: authData, error: authError } =
            await supabase.auth.getUser()

        if (!authError && authData?.user) {
            const userId = authData.user.id

            // Buscar informações do perfil na tabela profiles
            // (email vem do auth, não da tabela)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, description, display_name, avatar_url, rating')
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
                userProfile = { ...profileData, email: authData.user.email }
            }
        }
    } catch (error) {
        console.log('Falha ao buscar informações do usuário', error)
    }

    return (
        <AuthProvider>
            <div className="min-h-screen bg-mir-bg font-sans text-mir-text">
                <Header userProfile={userProfile} />
                <main className="relative">{children}</main>
                <div className="mir-grain" aria-hidden="true" />
            </div>
        </AuthProvider>
    )
}
