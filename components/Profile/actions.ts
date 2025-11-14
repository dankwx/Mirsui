'use server'

import { createClientForActions } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateDisplayName(
    formData: FormData
): Promise<{ success: boolean; newDisplayName?: string }> {
    const newDisplayName = formData.get('display_name')
    const supabase = await createClientForActions()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user && newDisplayName && typeof newDisplayName === 'string') {
        // Atualizar o display_name na tabela 'profiles'
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ display_name: newDisplayName })
            .eq('id', user.id)

        if (profileError) {
            console.error('Error updating profile:', profileError)
            return { success: false }
        }

        // Atualizar o display_name nos metadados do usuário
        const { error: userError } = await supabase.auth.updateUser({
            data: { display_name: newDisplayName },
        })

        if (userError) {
            console.error('Error updating user metadata:', userError)
            return { success: false }
        }

        return { success: true, newDisplayName }
    }
    return { success: false }
}

export async function updateDescription(
    formData: FormData
): Promise<{ success: boolean; newDescription?: string | null }> {
    const newDescription = formData.get('description')
    const supabase = await createClientForActions()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        // Converta a string vazia para null aqui
        const descriptionToUpdate =
            newDescription === '' ? null : (newDescription as string)

        // Atualizar a descrição na tabela 'profiles'
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ description: descriptionToUpdate })
            .eq('id', user.id)

        if (profileError) {
            console.error('Error updating profile description:', profileError)
            return { success: false }
        }

        // Atualizar a descrição nos metadados do usuário (se necessário)
        const { error: userError } = await supabase.auth.updateUser({
            data: { description: descriptionToUpdate },
        })

        if (userError) {
            console.error('Error updating user metadata:', userError)
            return { success: false }
        }

        revalidatePath(`/user/${user.id}`) // ou o caminho apropriado para o perfil do usuário
        return { success: true, newDescription: descriptionToUpdate }
    }
    return { success: false }
}

export async function toggleFollow(
    followingId: string
): Promise<{ success: boolean; isFollowing: boolean }> {
    const supabase = await createClientForActions()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, isFollowing: false }
    }

    const follower_id = user.id

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
        .from('followers')
        .select()
        .eq('follower_id', follower_id)
        .eq('following_id', followingId)
        .single()

    if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking follow status:', checkError)
        return { success: false, isFollowing: false }
    }

    if (existingFollow) {
        // Unfollow
        const { error: unfollowError } = await supabase
            .from('followers')
            .delete()
            .eq('follower_id', follower_id)
            .eq('following_id', followingId)

        if (unfollowError) {
            console.error('Error unfollowing:', unfollowError)
            return { success: false, isFollowing: true }
        }

        revalidatePath(`/user/${followingId}`)
        return { success: true, isFollowing: false }
    } else {
        // Follow
        const { error: followError } = await supabase
            .from('followers')
            .insert({ follower_id, following_id: followingId })

        if (followError) {
            console.error('Error following:', followError)
            return { success: false, isFollowing: false }
        }

        revalidatePath(`/user/${followingId}`)
        return { success: true, isFollowing: !existingFollow }
    }
}

export async function removeTrack(trackId: string) {
    try {
        const supabase = await createClientForActions()

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
        const supabase = await createClientForActions()

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
