import { createClient } from '@/utils/supabase/server'
import { getFeedPostsWithInteractions, FeedPostWithInteractions } from './socialInteractionsService'

export interface FeedPost {
    id: string
    user: {
        username: string
        display_name?: string
        avatar_url?: string
        user_id: string
    }
    track: {
        title: string
        artist: string
        track_uri?: string
        track_url?: string
        track_thumbnail?: string
        popularity?: number
        position: number
    }
    claim_message?: string
    timestamp: string
    discover_rating?: number
    likes_count: number
    comments_count: number
}

// Atualizar a função getFeedPosts para usar a nova versão com interações
export async function getFeedPosts(limit: number = 20): Promise<FeedPost[]> {
    const posts = await getFeedPostsWithInteractions(limit, 0)
    
    // Transformar dados para o formato do feed
    return posts.map(post => ({
        id: post.id.toString(),
        user: {
            username: post.username,
            display_name: post.display_name || undefined,
            avatar_url: post.avatar_url || undefined,
            user_id: post.user_id
        },
        track: {
            title: post.track_title,
            artist: post.artist_name,
            track_uri: post.track_uri || undefined,
            track_url: post.track_url,
            track_thumbnail: post.track_thumbnail || undefined,
            popularity: post.popularity,
            position: post.position
        },
        claim_message: post.claim_message || undefined,
        timestamp: post.claimedat!,
        discover_rating: post.discover_rating || undefined,
        likes_count: post.likes_count,
        comments_count: post.comments_count
    }))
}

// Exportar as funções utilitárias para evitar breaking changes
export { getUserBadge, isUserVerified, formatTimestamp } from './feedHelpers'
