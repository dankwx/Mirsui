import { createClient } from '@/utils/supabase/server'

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
}

export async function getFeedPosts(limit: number = 20): Promise<FeedPost[]> {
    const supabase = createClient()

    try {
        // Buscar claims recentes com informações dos usuários e tracks
        const { data, error } = await supabase
            .from('tracks')
            .select(`
                id,
                track_title,
                artist_name,
                track_uri,
                track_url,
                track_thumbnail,
                popularity,
                position,
                claim_message,
                claimedat,
                discover_rating,
                user_id,
                profiles:user_id (
                    username,
                    display_name,
                    avatar_url
                )
            `)
            .not('claimedat', 'is', null)
            .order('claimedat', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Erro ao buscar posts do feed:', error)
            return []
        }

        // Transformar dados para o formato do feed
        const feedPosts: FeedPost[] = (data || []).map(claim => {
            const profile = Array.isArray(claim.profiles) ? claim.profiles[0] : claim.profiles
            
            return {
                id: claim.id.toString(),
                user: {
                    username: profile?.username || `user_${claim.user_id.slice(0, 8)}`,
                    display_name: profile?.display_name,
                    avatar_url: profile?.avatar_url,
                    user_id: claim.user_id
                },
                track: {
                    title: claim.track_title,
                    artist: claim.artist_name,
                    track_uri: claim.track_uri,
                    track_url: claim.track_url,
                    track_thumbnail: claim.track_thumbnail,
                    popularity: claim.popularity,
                    position: claim.position
                },
                claim_message: claim.claim_message,
                timestamp: claim.claimedat!,
                discover_rating: claim.discover_rating
            }
        })

        return feedPosts

    } catch (error) {
        console.error('Erro ao buscar dados do feed:', error)
        return []
    }
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
