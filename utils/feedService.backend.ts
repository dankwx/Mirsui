// utils/feedService.backend.ts - Service para buscar dados do feed via backend
import { cookies } from 'next/headers'
import { getSupabaseCookieName } from '@/utils/supabase/cookie-helper'

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

// Função auxiliar para pegar o token do cookie
function getAccessToken(): string | null {
    try {
        const cookieStore = cookies()
        const cookieName = getSupabaseCookieName()
        const cookieValue = cookieStore.get(cookieName)?.value

        if (!cookieValue) return null

        const session = JSON.parse(cookieValue)
        return session.access_token || null
    } catch (error) {
        console.error('Erro ao pegar token:', error)
        return null
    }
}

/**
 * Busca posts do feed com interações via backend
 */
export async function getFeedPostsWithInteractions(
  limit: number = 20,
  offset: number = 0
): Promise<FeedPostWithInteractions[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/feed?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Sempre buscar dados frescos
    })

    if (!response.ok) {
      console.error('Erro ao buscar feed:', response.status)
      return []
    }

    const data = await response.json()
    return data.posts || []
  } catch (error) {
    console.error('Erro ao buscar feed:', error)
    return []
  }
}

/**
 * Busca reivindicações recentes via backend
 */
export async function getRecentClaims(limit: number = 4): Promise<RecentClaim[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/feed/recent-claims?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            console.error('Erro ao buscar reivindicações recentes:', response.status)
            return []
        }

        const data = await response.json()
        return data.claims || []
    } catch (error) {
        console.error('Erro ao buscar reivindicações recentes:', error)
        return []
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

    const token = getAccessToken()

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
