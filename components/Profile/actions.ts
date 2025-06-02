'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateDisplayName(
    formData: FormData
): Promise<{ success: boolean; newDisplayName?: string }> {
    const newDisplayName = formData.get('display_name')
    const supabase = createClient()
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
    const supabase = createClient()
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
    const supabase = createClient()
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

export async function removeTrack(
    trackId: string
): Promise<{ success: boolean; message?: string }> {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'User not authenticated' }
    }

    try {
        // Verificar se a track pertence ao usuário logado
        const { data: track, error: fetchError } = await supabase
            .from('tracks')
            .select('user_id')
            .eq('id', trackId)
            .single()

        if (fetchError) {
            console.error('Error fetching track:', fetchError)
            return { success: false, message: 'Track not found' }
        }

        if (track.user_id !== user.id) {
            return {
                success: false,
                message: 'Unauthorized to delete this track',
            }
        }

        // Remover a track
        const { error: deleteError } = await supabase
            .from('tracks')
            .delete()
            .eq('id', trackId)
            .eq('user_id', user.id) // Segurança adicional

        if (deleteError) {
            console.error('Error deleting track:', deleteError)
            return { success: false, message: 'Failed to delete track' }
        }

        // Revalidar as páginas relevantes
        revalidatePath(`/user/${user.id}`)

        return { success: true, message: 'Track removed successfully' }
    } catch (error) {
        console.error('Unexpected error removing track:', error)
        return { success: false, message: 'Unexpected error occurred' }
    }
}
