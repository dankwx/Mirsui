import { createClient } from '@/utils/supabase/server'

export async function fetchUserData(username: string) {
    const supabase = await createClient()
    const {
        data: { user: currentUser },
    } = await supabase.auth.getUser()

    // Buscar dados do usuário do perfil (apenas campos públicos — email fica de fora)
    const { data: userData, error } = await supabase
        .from('profiles')
        .select('id, username, description, display_name, avatar_url, rating')
        .eq('username', username)
        .single()

    if (error || !userData) {
        return { userData: null, error }
    }

    // Verificar se o usuário atual está seguindo o usuário do perfil
    let isFollowing = false
    if (currentUser) {
        const { data: followData, error: followError } = await supabase
            .from('followers')
            .select()
            .eq('follower_id', currentUser.id)
            .eq('following_id', userData.id)
            .single()

        if (!followError && followData) {
            isFollowing = true
        }
    }

    return { userData: { ...userData, isFollowing }, error: null }
}

export const fetchAuthData = async () => {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    return authData
}
