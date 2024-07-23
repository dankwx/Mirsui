import { createClient } from '@/utils/supabase/server'

// Função para buscar os seguidores
export async function fetchFollowers(userId: string) {
    const supabase = createClient()
    try {
        const { data, error, status } = await supabase
            .from('followers')
            .select(`
                follower:follower_id (
                    id,
                    email
                   
                )
            `)
            .eq('following_id', userId)

        if (error && status !== 406) {
            throw error
        }

        
        // Extrair apenas os dados do follower
        const followers = data?.map(item => item.follower) || []
        
        return followers
    } catch (error) {
        console.error('Erro ao buscar seguidores:', error)
        return []
    }
}

// Função para buscar quem o usuário está seguindo
export async function fetchFollowing(userId: string) {
    const supabase = createClient()

    try {
        const { data, error, status } = await supabase
            .from('followers')
            .select(`
                following:following_id (
                    id,
                    email
                
                )
            `)
            .eq('follower_id', userId)

        if (error && status !== 406) {
            throw error
        }


        if (data) {
            const following = data.map(item => item.following)
            return following
        } else {
            console.log('Nenhum seguido encontrado')
            return []
        }
    } catch (error) {
        console.error('Erro ao buscar seguidos:', error)
        return []
    }
}
