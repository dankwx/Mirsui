'use server'

import { createClientForActions } from '@/utils/supabase/server'

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
