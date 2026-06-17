'use server'

import { createClientForActions } from '@/utils/supabase/server'
import {
    TRACK_COMMENT_SELECT,
    flattenTrackComment,
    type TrackComment,
} from '@/utils/trackComments'

const MAX_LENGTH = 1000

type ActionResult<T = undefined> =
    | ({ success: true } & (T extends undefined ? {} : { data: T }))
    | { success: false; message: string }

/** Curte (like=true) ou descurte (like=false) uma track. Idempotente. */
export async function toggleTrackLike(trackId: number, like: boolean): Promise<ActionResult> {
    const supabase = await createClientForActions()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Você precisa estar logado para curtir.' }
    }

    if (like) {
        const { error } = await supabase
            .from('track_likes')
            .insert({ track_id: trackId, user_id: user.id })

        // 23505 = unique_violation: já curtiu, tratamos como sucesso (idempotente).
        if (error && error.code !== '23505') {
            console.error('Error liking track:', error)
            return { success: false, message: 'Não foi possível curtir.' }
        }
    } else {
        const { error } = await supabase
            .from('track_likes')
            .delete()
            .eq('track_id', trackId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error unliking track:', error)
            return { success: false, message: 'Não foi possível descurtir.' }
        }
    }

    return { success: true }
}

/** Cria um comentário em uma track. */
export async function addTrackComment(
    trackId: number,
    text: string
): Promise<ActionResult<TrackComment>> {
    const trimmed = text.trim()

    if (!trimmed) {
        return { success: false, message: 'O comentário não pode estar vazio.' }
    }
    if (trimmed.length > MAX_LENGTH) {
        return { success: false, message: `O comentário pode ter no máximo ${MAX_LENGTH} caracteres.` }
    }

    const supabase = await createClientForActions()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Você precisa estar logado para comentar.' }
    }

    const { data, error } = await supabase
        .from('track_comments')
        .insert({ track_id: trackId, user_id: user.id, comment_text: trimmed })
        .select(TRACK_COMMENT_SELECT)
        .single()

    if (error || !data) {
        console.error('Error adding track comment:', error)
        return { success: false, message: 'Não foi possível enviar o comentário.' }
    }

    return { success: true, data: flattenTrackComment(data) }
}

/** Remove um comentário (apenas o autor — garantido pela RLS). */
export async function deleteTrackComment(commentId: number): Promise<ActionResult> {
    const supabase = await createClientForActions()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Você precisa estar logado.' }
    }

    // A RLS garante que apenas o autor consegue apagar.
    const { error } = await supabase.from('track_comments').delete().eq('id', commentId)

    if (error) {
        console.error('Error deleting track comment:', error)
        return { success: false, message: 'Não foi possível remover o comentário.' }
    }

    return { success: true }
}
