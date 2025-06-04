// types/profile.ts - Tipos atualizados
export interface User {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
    username: string | null
    display_name?: string
    description?: string | null
    rating?: number
    followingId: string
    isFollowing?: boolean
}

export interface Achievement {
    achievement_id: string
    title: string
    description: string
    achieved_at: string
}

export interface Rating {
    id: string
    rating: number
}

// Novo tipo para as tracks com favoritos
export interface Song {
    id: string
    track_url: string
    track_uri: string | null
    track_title: string
    artist_name: string
    album_name: string
    popularity: number
    discover_rating: number | null
    track_thumbnail: string | null
    claimedat: string | null
    is_favorited: boolean // Favorito do DONO do perfil (público)
    is_user_favorited?: boolean // Favorito do usuário logado (para funcionalidade)
    favorite_count?: number
}
