// Tipos e constantes puros dos comentários de track.
// NÃO importe nada de server-only aqui — este módulo é compartilhado entre
// Server Components, Server Actions e Client Components (espelha utils/profileComments.ts).

export const TRACK_COMMENTS_PAGE_SIZE = 10

// Embute o perfil do autor via FK track_comments_user_id_fkey.
export const TRACK_COMMENT_SELECT =
    'id, comment_text, created_at, user_id, track_id, profiles:user_id(username, display_name, avatar_url)'

// Formato achatado consumido pela UI.
export interface TrackComment {
    id: number
    track_id: number
    user_id: string
    comment_text: string
    created_at: string
    updated_at: string
    username: string
    display_name: string | null
    avatar_url: string | null
}

// Converte a linha do Supabase (com perfil aninhado) para o formato achatado da UI.
export function flattenTrackComment(row: any): TrackComment {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    return {
        id: row.id,
        track_id: row.track_id,
        user_id: row.user_id,
        comment_text: row.comment_text,
        created_at: row.created_at,
        updated_at: row.created_at,
        username: profile?.username ?? '',
        display_name: profile?.display_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
    }
}
