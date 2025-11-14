import { createClient } from '@/utils/supabase/server'

export interface TimelineData {
  date: string
  claims: number
  spotifyPopularity: number
  event?: string | null
  eventUser?: string | null
  daysSinceStart: number
}

export interface EarlyAdopter {
  username: string
  display_name?: string
  avatar_url?: string
  position: number
  date: string
  status: string
  user_id: string
}

export interface TimelineEvent {
  date: string
  event: string
  eventUser: string
  claims: number
  spotifyPopularity: number
}

export async function getTrackTimelineData(trackUri: string): Promise<{
  timelineData: TimelineData[]
  earlyAdopters: EarlyAdopter[]
  events: TimelineEvent[]
}> {
  const supabase = await createClient()

  try {
    // Buscar todos os claims da track ordenados por data
    const { data: claims, error: claimsError } = await supabase
      .from('tracks')
      .select(`
        claimedat,
        popularity,
        position,
        user_id,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('track_uri', trackUri)
      .not('claimedat', 'is', null)
      .order('claimedat', { ascending: true })

    if (claimsError) {
      console.error('Erro ao buscar claims:', claimsError)
      return { timelineData: [], earlyAdopters: [], events: [] }
    }

    if (!claims || claims.length === 0) {
      return { timelineData: [], earlyAdopters: [], events: [] }
    }

    // Processar dados da timeline
    const startDate = new Date(claims[0].claimedat!)
    const timelineData: TimelineData[] = []
    const events: TimelineEvent[] = []
    
    // Agrupar claims por dia
    const claimsByDay = new Map<string, { count: number, avgPopularity: number, users: any[] }>()
    
    claims.forEach(claim => {
      const date = new Date(claim.claimedat!).toISOString().split('T')[0]
      if (!claimsByDay.has(date)) {
        claimsByDay.set(date, { count: 0, avgPopularity: 0, users: [] })
      }
      const dayData = claimsByDay.get(date)!
      dayData.count++
      dayData.avgPopularity = (dayData.avgPopularity + claim.popularity) / 2
      dayData.users.push(claim)
    })

    // Criar dados da timeline
    let cumulativeClaims = 0
    Array.from(claimsByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, dayData]) => {
        cumulativeClaims += dayData.count
        const daysSinceStart = Math.floor(
          (new Date(date).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Detectar eventos especiais
        let event: string | null = null
        let eventUser: string | null = null

        if (cumulativeClaims === 1) {
          event = 'first_claim'
          const profile = Array.isArray(dayData.users[0]?.profiles) ? dayData.users[0]?.profiles[0] : dayData.users[0]?.profiles
          eventUser = profile?.username || 'Usuário'
        } else if (cumulativeClaims === 5) {
          event = 'early_adopters'
          const profile = Array.isArray(dayData.users[0]?.profiles) ? dayData.users[0]?.profiles[0] : dayData.users[0]?.profiles
          eventUser = profile?.username || 'Usuário'
        } else if (cumulativeClaims === 25) {
          event = 'momentum'
          const profile = Array.isArray(dayData.users[0]?.profiles) ? dayData.users[0]?.profiles[0] : dayData.users[0]?.profiles
          eventUser = profile?.username || 'Usuário'
        } else if (cumulativeClaims === 50) {
          event = 'boom_detected'
          const profile = Array.isArray(dayData.users[0]?.profiles) ? dayData.users[0]?.profiles[0] : dayData.users[0]?.profiles
          eventUser = profile?.username || 'Usuário'
        } else if (cumulativeClaims === 100) {
          event = 'viral_tiktok'
          const profile = Array.isArray(dayData.users[0]?.profiles) ? dayData.users[0]?.profiles[0] : dayData.users[0]?.profiles
          eventUser = profile?.username || 'Usuário'
        } else if (cumulativeClaims >= 200) {
          event = 'mainstream'
          const profile = Array.isArray(dayData.users[0]?.profiles) ? dayData.users[0]?.profiles[0] : dayData.users[0]?.profiles
          eventUser = profile?.username || 'Usuário'
        }

        timelineData.push({
          date,
          claims: cumulativeClaims,
          spotifyPopularity: Math.round(dayData.avgPopularity),
          event,
          eventUser,
          daysSinceStart
        })

        if (event && eventUser) {
          events.push({
            date,
            event,
            eventUser,
            claims: cumulativeClaims,
            spotifyPopularity: Math.round(dayData.avgPopularity)
          })
        }
      })

    // Buscar early adopters (primeiros 8 claimers)
    const earlyAdopters: EarlyAdopter[] = claims
      .slice(0, 8)
      .map((claim, index) => {
        const profile = Array.isArray(claim.profiles) ? claim.profiles[0] : claim.profiles
        const username = profile?.username || `user_${claim.user_id.slice(0, 8)}`
        const displayName = profile?.display_name || username
        
        return {
          username,
          display_name: displayName,
          avatar_url: profile?.avatar_url,
          position: claim.position || index + 1,
          date: claim.claimedat!,
          status: getHipsterStatus(index + 1),
          user_id: claim.user_id
        }
      })

    return {
      timelineData,
      earlyAdopters,
      events
    }

  } catch (error) {
    console.error('Erro ao buscar dados da timeline:', error)
    return { timelineData: [], earlyAdopters: [], events: [] }
  }
}

function getHipsterStatus(position: number): string {
  switch (position) {
    case 1: return 'Primeiro Claim!'
    case 2: return 'Hipster Alert'
    case 3: return 'Early Bird'
    case 4: return 'Taste Maker'
    case 5: return 'Discoverer'
    case 6: return 'Pioneer'
    case 7: return 'Visionary'
    case 8: return 'Risk Taker'
    default: return 'Early Adopter'
  }
}

export function getAvatarEmoji(position: number): string {
  const emojis = ['👑', '🎧', '🎸', '✨', '🔍', '🎯', '🧠', '⚡']
  return emojis[position - 1] || '🎵'
}
