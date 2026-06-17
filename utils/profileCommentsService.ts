import { createClient } from '@/utils/supabase/server'
import { RECADO_SELECT, RECADOS_PAGE_SIZE, type Recado } from '@/utils/profileComments'

/**
 * Busca os recados de um mural de perfil (fixados primeiro, mais recentes depois).
 * Retorna a página solicitada e o total de recados.
 */
export async function fetchProfileComments(
    profileId: string,
    { limit = RECADOS_PAGE_SIZE, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<{ comments: Recado[]; total: number }> {
    const supabase = await createClient()

    const { data, count, error } = await supabase
        .from('profile_comments')
        .select(RECADO_SELECT, { count: 'exact' })
        .eq('profile_id', profileId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error fetching profile comments:', error)
        return { comments: [], total: 0 }
    }

    return {
        comments: (data ?? []) as unknown as Recado[],
        total: count ?? 0,
    }
}
