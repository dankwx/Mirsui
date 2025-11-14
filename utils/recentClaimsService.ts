// utils/recentClaimsService.ts
import { createClient } from '@/utils/supabase/server'

export interface RecentClaim {
    id: number
    track_title: string
    artist_name: string
    track_thumbnail: string
    track_url: string
    claimedat: string
}

/**
 * Busca as reivindicações mais recentes (sem duplicatas de músicas)
 * @param limit Número de reivindicações únicas para buscar (padrão: 4)
 * @returns Array de reivindicações recentes sem músicas duplicadas
 */
export async function getRecentClaims(limit: number = 4): Promise<RecentClaim[]> {
    const supabase = await createClient()

    try {
        // Buscar mais reivindicações do que o necessário para filtrar duplicatas
        const { data, error } = await supabase
            .from('tracks')
            .select('id, track_title, artist_name, track_thumbnail, track_url, claimedat, track_uri')
            .not('claimedat', 'is', null)
            .order('claimedat', { ascending: false })
            .limit(limit * 5) // Buscar 5x mais para garantir músicas únicas

        if (error) {
            console.error('Erro ao buscar reivindicações recentes:', error)
            return []
        }

        if (!data) return []

        // Filtrar músicas únicas baseado no track_uri (identificador único da música)
        const uniqueTracks = new Map<string, RecentClaim>()
        
        for (const track of data) {
            if (track.track_uri && !uniqueTracks.has(track.track_uri)) {
                uniqueTracks.set(track.track_uri, {
                    id: track.id,
                    track_title: track.track_title,
                    artist_name: track.artist_name,
                    track_thumbnail: track.track_thumbnail,
                    track_url: track.track_url,
                    claimedat: track.claimedat
                })
            }
            
            // Parar quando atingir o limite desejado
            if (uniqueTracks.size >= limit) break
        }

        return Array.from(uniqueTracks.values())
    } catch (error) {
        console.error('Erro ao buscar reivindicações recentes:', error)
        return []
    }
}
