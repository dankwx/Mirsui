import { createClient } from '@/utils/supabase/server'

export async function getTopTrackClaimers(trackUri: string, limit: number = 10) {
  const supabase = await createClient()

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
