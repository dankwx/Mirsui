// Tipos e constantes puros do mural de recados.
// NÃO importe nada de server-only aqui (ex.: next/headers) — este módulo
// é compartilhado entre Server Components, Server Actions e Client Components.

export const RECADOS_PAGE_SIZE = 10

export const RECADO_SELECT =
    'id, content, is_pinned, created_at, author:profiles!profile_comments_author_id_fkey(id, username, display_name, avatar_url)'

export interface RecadoAuthor {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
}

export interface Recado {
    id: string
    content: string
    is_pinned: boolean
    created_at: string
    author: RecadoAuthor | null
}
