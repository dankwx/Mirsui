import { createClient } from '@/utils/supabase/server'

export interface PopularityTrendData {
  date: string
  avg_popularity: number
  claim_count: number
}

export interface TrackStatsData {
  weeklyClaimsCount: number
  monthlyGrowthPercentage: number
  totalClaims: number
}

export async function getTrackPopularityTrend(
  trackUri: string,
  days: number = 30
): Promise<PopularityTrendData[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('get_track_popularity_trend', {
      p_track_uri: trackUri,
      p_days: days
    })
  
  if (error) {
    console.error('Erro ao buscar tendência de popularidade:', error)
    return []
  }
  
  return data || []
}

export async function getTrackStats(trackUri: string): Promise<TrackStatsData> {
  try {
    // Buscar dados dos últimos 30 dias
    const popularityTrend = await getTrackPopularityTrend(trackUri, 30)
    
    // Calcular reivindicações da semana (últimos 7 dias)
    const weeklyClaimsCount = popularityTrend
      .slice(-7)
      .reduce((sum, day) => sum + day.claim_count, 0)
    
    // Calcular crescimento mensal
    let monthlyGrowthPercentage = 0
    if (popularityTrend.length >= 2) {
      const firstEntry = popularityTrend[0]
      const lastEntry = popularityTrend[popularityTrend.length - 1]
      
      if (firstEntry.avg_popularity > 0) {
        monthlyGrowthPercentage = 
          ((lastEntry.avg_popularity - firstEntry.avg_popularity) / firstEntry.avg_popularity) * 100
      }
    }
    
    // Total de claims (somar todos os claim_count)
    const totalClaims = popularityTrend.reduce((sum, day) => sum + day.claim_count, 0)
    
    return {
      weeklyClaimsCount,
      monthlyGrowthPercentage,
      totalClaims
    }
  } catch (error) {
    console.error('Erro ao calcular estatísticas da track:', error)
    return {
      weeklyClaimsCount: 0,
      monthlyGrowthPercentage: 0,
      totalClaims: 0
    }
  }
}

export async function getTopTrackClaimers(trackUri: string, limit: number = 10) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      user_id,
      position,
      claimedat,
      profiles:user_id (
        username,
        avatar_url,
        display_name
      )
    `)
    .eq('track_uri', trackUri)
    .order('position', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Erro ao buscar top claimers:', error)
    return []
  }
  
  return data || []
}
