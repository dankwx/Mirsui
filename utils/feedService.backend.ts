// utils/feedService.backend.ts - Service para buscar dados do feed via backend
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export interface FeedPostWithInteractions {
  id: number
  track_url: string
  track_title: string
  artist_name: string
  album_name: string
  popularity: number
  track_thumbnail: string | null
  user_id: string
  position: number
  claimedat: string | null
  track_uri: string | null
  discover_rating: number | null
  claim_message: string | null
  youtube_url: string | null
  username: string
  display_name: string | null
  avatar_url: string | null
  likes_count: number
  comments_count: number
}

export interface RecentClaim {
    id: number
    track_title: string
    artist_name: string
    track_thumbnail: string
    track_url: string
    claimedat: string
}

/**
 * `failed` separa "não veio nada" de "a busca falhou". Sem isso, um 429 ou um
 * 500 rendezia lista vazia e a tela dizia que a cena estava parada — o usuário
 * não tinha como saber que era erro.
 */
export interface FeedPostsResult {
  posts: FeedPostWithInteractions[]
  failed: boolean
}

export interface RecentClaimsResult {
  claims: RecentClaim[]
  failed: boolean
}

/**
 * O token vai junto mesmo em rota de leitura pública porque o rate limit do
 * backend chaveia por usuário (ver mirsui-backend/src/lib/rateLimitKeys.ts).
 * Sem ele, a chave cai no IP — que é sempre o do servidor Next, já que estas
 * funções rodam no server component da /feed — e todas as visitas do app
 * dividiam um balde só de 100 req / 15 min.
 */
async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = await getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

/**
 * Busca posts do feed com interações via backend
 */
export async function getFeedPostsWithInteractions(
  limit: number = 20,
  offset: number = 0
): Promise<FeedPostsResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/feed?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: await authHeaders(),
      cache: 'no-store', // Sempre buscar dados frescos
    })

    if (!response.ok) {
      console.error('Erro ao buscar feed:', response.status)
      return { posts: [], failed: true }
    }

    const data = await response.json()
    return { posts: data.posts || [], failed: false }
  } catch (error) {
    console.error('Erro ao buscar feed:', error)
    return { posts: [], failed: true }
  }
}

/**
 * Busca os achados recentes via backend
 */
export async function getRecentClaims(limit: number = 4): Promise<RecentClaimsResult> {
    try {
        const response = await fetch(`${BACKEND_URL}/feed/recent-claims?limit=${limit}`, {
            method: 'GET',
            headers: await authHeaders(),
            cache: 'no-store',
        })

        if (!response.ok) {
            console.error('Erro ao buscar achados recentes:', response.status)
            return { claims: [], failed: true }
        }

        const data = await response.json()
        return { claims: data.claims || [], failed: false }
    } catch (error) {
        console.error('Erro ao buscar achados recentes:', error)
        return { claims: [], failed: true }
    }
}

/**
 * Verifica quais tracks o usuário curtiu
 */
export async function checkUserLikedTracks(
  trackIds: number[]
): Promise<Set<number>> {
  try {
    if (trackIds.length === 0) {
      return new Set()
    }

    const token = await getAccessToken()

    if (!token) {
      // Usuário não está logado
      return new Set()
    }

    const response = await fetch(`${BACKEND_URL}/feed/user-likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ track_ids: trackIds }),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Erro ao buscar likes do usuário:', response.status)
      return new Set()
    }

    const data = await response.json()
    return new Set(data.liked_tracks || [])
  } catch (error) {
    console.error('Erro ao buscar likes do usuário:', error)
    return new Set()
  }
}
