// types/profile.ts
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
