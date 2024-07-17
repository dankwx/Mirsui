import { createClient } from '@/utils/supabase/server'

export const fetchUserData = async (username: string) => {
    const supabase = createClient()

    const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (error || !userData) {
        return { userData: null, error }
    }

    return { userData, error: null }
}

export const fetchAuthData = async () => {
    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    return authData
}
