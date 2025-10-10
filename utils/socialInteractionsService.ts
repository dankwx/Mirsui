import { createClient } from '@/utils/supabase/server'

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

// Buscar posts do feed com contadores de interações (SERVER ONLY) - Versão Otimizada
export async function getFeedPostsWithInteractions(
  limit: number = 20,
  offset: number = 0
): Promise<FeedPostWithInteractions[]> {
  const supabase = createClient()
  
  try {
    // Query mais eficiente usando agregação SQL
    const { data, error } = await supabase
      .from('tracks')
      .select(`
        id,
        track_url,
        track_title,
        artist_name,
        album_name,
        popularity,
        track_thumbnail,
        user_id,
        position,
        claimedat,
        track_uri,
        discover_rating,
        claim_message,
        youtube_url,
        profiles:user_id!inner (
          username,
          display_name,
          avatar_url
        )
      `)
      .not('claimedat', 'is', null)
      .order('claimedat', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Erro ao buscar posts do feed:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Buscar contadores de likes e comentários em paralelo para melhor performance
    const trackIds = data.map((track: any) => track.id)
    
    const [likesResult, commentsResult] = await Promise.all([
      supabase
        .from('track_likes')
        .select('track_id')
        .in('track_id', trackIds),
      supabase
        .from('track_comments')
        .select('track_id')
        .in('track_id', trackIds)
    ])

    // Contar likes por track
    const likesCountByTrack = (likesResult.data || []).reduce((acc: Record<number, number>, like: any) => {
      acc[like.track_id] = (acc[like.track_id] || 0) + 1
      return acc
    }, {})

    // Contar comentários por track
    const commentsCountByTrack = (commentsResult.data || []).reduce((acc: Record<number, number>, comment: any) => {
      acc[comment.track_id] = (acc[comment.track_id] || 0) + 1
      return acc
    }, {})

    // Processar dados finais
    const tracksWithInteractions = data.map((track: any) => {
      const profile = track.profiles

      return {
        id: track.id,
        track_url: track.track_url,
        track_title: track.track_title,
        artist_name: track.artist_name,
        album_name: track.album_name,
        popularity: track.popularity,
        track_thumbnail: track.track_thumbnail,
        user_id: track.user_id,
        position: track.position,
        claimedat: track.claimedat,
        track_uri: track.track_uri,
        discover_rating: track.discover_rating,
        claim_message: track.claim_message,
        youtube_url: track.youtube_url,
        username: profile?.username || '',
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        likes_count: likesCountByTrack[track.id] || 0,
        comments_count: commentsCountByTrack[track.id] || 0
      }
    })

    return tracksWithInteractions
  } catch (error) {
    console.error('Erro crítico ao buscar feed:', error)
    return []
  }
}

// Verificar se usuário curtiu um post (SERVER ONLY)
export async function checkUserLikedTrack(
  trackId: number,
  userId: string
): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('track_likes')
    .select('id')
    .eq('track_id', trackId)
    .eq('user_id', userId)
    .single()
  
  if (error) {
    // Se não encontrou, é porque não curtiu
    return false
  }
  
  return !!data
}

// Verificar quais posts o usuário curtiu (otimizado para múltiplos posts)
export async function checkUserLikedTracks(
  trackIds: number[],
  userId: string
): Promise<Set<number>> {
  const supabase = createClient()
  
  if (trackIds.length === 0) {
    return new Set()
  }
  
  const { data, error } = await supabase
    .from('track_likes')
    .select('track_id')
    .eq('user_id', userId)
    .in('track_id', trackIds)
  
  if (error) {
    console.error('Erro ao buscar likes do usuário:', error)
    return new Set()
  }
  
  // Retornar Set com os IDs dos tracks que o usuário curtiu
  return new Set((data || []).map((like: any) => like.track_id))
}

// Buscar comentários de um post (SERVER ONLY)
export async function getTrackComments(
  trackId: number,
  limit: number = 10,
  offset: number = 0
): Promise<TrackComment[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('track_comments')
    .select(`
      id,
      track_id,
      user_id,
      comment_text,
      created_at,
      updated_at,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('track_id', trackId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Erro ao buscar comentários:', error)
    return []
  }
  
  // Transformar os dados para o formato esperado
  const comments = (data || []).map((comment: any) => ({
    id: comment.id,
    track_id: comment.track_id,
    user_id: comment.user_id,
    comment_text: comment.comment_text,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    username: comment.profiles?.username || '',
    display_name: comment.profiles?.display_name || null,
    avatar_url: comment.profiles?.avatar_url || null
  }))
  
  return comments
}