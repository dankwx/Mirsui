import 'server-only'

import { isAdmin } from '@/lib/admin'
import { createClient } from '@/utils/supabase/server'

export interface SessionUserProfile {
    id?: string
    email?: string
    username?: string
    description?: string
    display_name?: string
    avatar_url?: string
    rating?: number
}

export async function getSessionProfile(): Promise<{
    userProfile: SessionUserProfile | null
    dono: boolean
}> {
    const supabase = await createClient()
    let userProfile: SessionUserProfile | null = null
    let dono = false

    try {
        const { data: authData, error: authError } =
            await supabase.auth.getUser()

        if (!authError && authData?.user) {
            const userId = authData.user.id
            dono = isAdmin(authData.user.email)

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, description, display_name, avatar_url, rating')
                .eq('id', userId)
                .single()

            if (profileError) {
                console.log('Erro ao buscar perfil:', profileError)
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

    return { userProfile, dono }
}
