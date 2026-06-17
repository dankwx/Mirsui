'use server'

import { createClientForActions } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { RECADO_SELECT, type Recado } from '@/utils/profileComments'

const MAX_LENGTH = 500

type ActionResult<T = undefined> =
    | ({ success: true } & (T extends undefined ? {} : { data: T }))
    | { success: false; message: string }

/** Deixa um recado no mural de um perfil. */
export async function addRecado(
    profileId: string,
    content: string
): Promise<ActionResult<Recado>> {
    const trimmed = content.trim()

    if (!trimmed) {
        return { success: false, message: 'O recado não pode estar vazio.' }
    }
    if (trimmed.length > MAX_LENGTH) {
        return { success: false, message: `O recado pode ter no máximo ${MAX_LENGTH} caracteres.` }
    }

    const supabase = await createClientForActions()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Você precisa estar logado para deixar um recado.' }
    }

    const { data, error } = await supabase
        .from('profile_comments')
        .insert({ profile_id: profileId, author_id: user.id, content: trimmed })
        .select(RECADO_SELECT)
        .single()

    if (error || !data) {
        console.error('Error adding recado:', error)
        return { success: false, message: 'Não foi possível enviar o recado.' }
    }

    revalidatePath('/user/[username]', 'page')
    return { success: true, data: data as unknown as Recado }
}

/** Remove um recado (autor do recado ou dono do mural). */
export async function deleteRecado(recadoId: string): Promise<ActionResult> {
    const supabase = await createClientForActions()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Você precisa estar logado.' }
    }

    // A RLS garante que apenas autor ou dono do mural conseguem apagar.
    const { error } = await supabase.from('profile_comments').delete().eq('id', recadoId)

    if (error) {
        console.error('Error deleting recado:', error)
        return { success: false, message: 'Não foi possível remover o recado.' }
    }

    revalidatePath('/user/[username]', 'page')
    return { success: true }
}

/** Fixa/desafixa um recado (apenas o dono do mural — garantido pela RLS). */
export async function togglePinRecado(
    recadoId: string,
    isPinned: boolean
): Promise<ActionResult> {
    const supabase = await createClientForActions()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Você precisa estar logado.' }
    }

    const { error } = await supabase
        .from('profile_comments')
        .update({ is_pinned: isPinned })
        .eq('id', recadoId)

    if (error) {
        console.error('Error toggling pin on recado:', error)
        return { success: false, message: 'Não foi possível fixar o recado.' }
    }

    revalidatePath('/user/[username]', 'page')
    return { success: true }
}
