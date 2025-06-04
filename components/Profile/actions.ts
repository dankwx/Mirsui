'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function removeTrack(trackId: string) {
    try {
        const supabase = createClient()

        // Verificar se o usuário está autenticado
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, message: 'Usuário não autenticado' }
        }

        // Remover a track
        const { error } = await supabase
            .from('tracks')
            .delete()
            .eq('id', trackId)
            .eq('user_id', user.id) // Garantir que só o dono pode remover

        if (error) {
            console.error('Error removing track:', error)
            return { success: false, message: 'Erro ao remover a música' }
        }

        // Revalidar o cache da página
        revalidatePath('/user/[username]', 'page')

        return { success: true }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { success: false, message: 'Erro inesperado' }
    }
}

export async function toggleFavorite(trackId: string, shouldFavorite: boolean) {
    try {
        const supabase = createClient()

        // Verificar se o usuário está autenticado
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, message: 'Usuário não autenticado' }
        }

        if (shouldFavorite) {
            // Adicionar aos favoritos
            const { error } = await supabase.from('favorites').insert({
                user_id: user.id,
                track_id: trackId,
            })

            if (error) {
                // Se o erro for de duplicata, ignorar (já está favoritado)
                if (error.code === '23505') {
                    // código de violação de unique constraint
                    return { success: true }
                }
                console.error('Error adding favorite:', error)
                return {
                    success: false,
                    message: 'Erro ao adicionar aos favoritos',
                }
            }
        } else {
            // Remover dos favoritos
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('track_id', trackId)

            if (error) {
                console.error('Error removing favorite:', error)
                return {
                    success: false,
                    message: 'Erro ao remover dos favoritos',
                }
            }
        }

        // Revalidar o cache da página
        revalidatePath('/user/[username]', 'page')

        return { success: true }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { success: false, message: 'Erro inesperado' }
    }
}
