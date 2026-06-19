import { createClient } from '@/utils/supabase/server'

export interface TrendingTrack {
  id: number
  track_title: string
  artist_name: string
  album_name?: string
  track_thumbnail?: string
  track_url: string
  popularity: number
  position: number
  claimedat: string
  discover_rating?: number
  genre?: string
  year?: string
  likes_count: number
  comments_count: number
  total_claims: number
}

export async function getTrendingTracks(limit: number = 6): Promise<TrendingTrack[]> {
  const supabase = await createClient()
  
  // Buscar tracks mais populares e recentes (sem duplicatas)
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      id,
      track_title,
      artist_name,
      album_name,
      track_thumbnail,
      track_url,
      popularity,
      position,
      claimedat,
      discover_rating
    `)
    .not('claimedat', 'is', null)
    .not('track_thumbnail', 'is', null)
    .order('popularity', { ascending: false })
    .order('claimedat', { ascending: false })
    .limit(limit * 3) // Buscar mais para garantir variedade após deduplicação

  if (error) {
    console.error('Erro ao buscar tracks trending:', error)
    return []
  }

  // Remover duplicatas mantendo a primeira ocorrência (mais popular/recente)
  const uniqueTracks = new Map<string, typeof data[0]>()
  data?.forEach(track => {
    const key = `${track.track_title.toLowerCase()}-${track.artist_name.toLowerCase()}`
    if (!uniqueTracks.has(key)) {
      uniqueTracks.set(key, track)
    }
  })

  // Limitar ao número solicitado após deduplicação
  const deduplicatedData = Array.from(uniqueTracks.values()).slice(0, limit)

  // Para cada track, contar likes, comments e total de claims
  const tracksWithStats = await Promise.all(
    deduplicatedData.map(async (track) => {
      // Contar likes
      const { count: likesCount } = await supabase
        .from('track_likes')
        .select('*', { count: 'exact', head: true })
        .eq('track_id', track.id)

      // Contar comentários
      const { count: commentsCount } = await supabase
        .from('track_comments')
        .select('*', { count: 'exact', head: true })
        .eq('track_id', track.id)

      // Contar total de claims para esta track
      const { count: totalClaims } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('track_title', track.track_title)
        .eq('artist_name', track.artist_name)

      return {
        ...track,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
        total_claims: totalClaims || 1,
        genre: getGenreFromPopularity(track.popularity),
        year: new Date(track.claimedat).getFullYear().toString()
      }
    })
  )

  return tracksWithStats
}

export async function getRecentActivity(limit: number = 5) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      id,
      track_title,
      artist_name,
      track_thumbnail,
      position,
      claimedat,
      profiles:user_id!inner (
        username,
        display_name,
        avatar_url
      )
    `)
    .not('claimedat', 'is', null)
    .order('claimedat', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erro ao buscar atividade recente:', error)
    return []
  }

  return data || []
}

// Helper function para determinar gênero baseado na popularidade (aproximado)
function getGenreFromPopularity(popularity: number): string {
  if (popularity > 80) return 'Pop'
  if (popularity > 60) return 'Electronic'
  if (popularity > 40) return 'Indie Pop'
  if (popularity > 20) return 'Alternative'
  return 'Indie'
}