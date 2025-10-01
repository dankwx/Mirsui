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

// Helper function para formatar timestamp
export function formatTimestamp(timestamp: string): string {
    const now = new Date()
    const claimedDate = new Date(timestamp)
    const diffInSeconds = Math.floor(
        (now.getTime() - claimedDate.getTime()) / 1000
    )

    const minutes = Math.floor(diffInSeconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (diffInSeconds < 60) {
        return 'agora mesmo'
    } else if (minutes < 60) {
        return `${minutes}min`
    } else if (hours < 24) {
        return `${hours}h`
    } else if (days < 7) {
        return `${days}d`
    } else {
        return claimedDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
        })
    }
}

// Função para determinar o badge do usuário baseado na posição e discover rating
export function getUserBadge(position: number, discoverRating?: number): string {
    if (position === 1) return 'Primeiro!'
    if (position <= 3) return 'Early Bird'
    if (position <= 10) return 'Hipster'
    if (discoverRating && discoverRating > 90) return 'Taste Maker'
    if (position <= 50) return 'Discoverer'
    return 'Music Lover'
}

// Função para determinar se o usuário é verificado (baseado em critérios simples)
export function isUserVerified(position: number): boolean {
    return position === 1 // Por exemplo, apenas primeiros claimers são "verificados"
}
