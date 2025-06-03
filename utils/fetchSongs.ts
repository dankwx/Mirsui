import { createClient } from '@/utils/supabase/server'
import type { Song } from '@/types/profile'

export async function fetchSongs(
    userId: string,
    currentUserId?: string
): Promise<Song[]> {
    const supabase = createClient()

    let query = supabase
        .from('tracks')
        .select(
            `
            id,
            track_url,
            track_uri,
            track_title,
            artist_name,
            album_name,
            popularity,
            discover_rating,
            track_thumbnail,
            claimedat
        `
        )
        .eq('user_id', userId)
        .order('claimedat', { ascending: false })

    const { data: tracksData, error } = await query

    if (error) {
        console.error('Error fetching songs:', error)
        return []
    }

    if (!tracksData || tracksData.length === 0) {
        return []
    }

    // Se temos um usuário logado, buscar os favoritos
    let favoritesData: any[] = []
    if (currentUserId) {
        const trackIds = tracksData.map((track) => track.id)

        const { data: favorites, error: favError } = await supabase
            .from('favorites')
            .select('track_id')
            .eq('user_id', currentUserId)
            .in('track_id', trackIds)

        if (!favError && favorites) {
            favoritesData = favorites
        }
    }

    // Opcional: buscar contagem total de favoritos por track
    const trackIds = tracksData.map((track) => track.id)
    const { data: favoriteCounts } = await supabase
        .from('favorites')
        .select('track_id')
        .in('track_id', trackIds)

    // Criar mapa de contagens
    const countsMap = new Map<string, number>()
    if (favoriteCounts) {
        favoriteCounts.forEach((fav) => {
            const count = countsMap.get(fav.track_id) || 0
            countsMap.set(fav.track_id, count + 1)
        })
    }

    // Criar set de tracks favoritadas pelo usuário atual
    const userFavorites = new Set(favoritesData.map((fav) => fav.track_id))

    // Format the songs array
    const formattedData: Song[] = tracksData.map((item: any) => ({
        id: item.id.toString(),
        track_url: item.track_url,
        track_uri: item.track_uri,
        track_title: item.track_title,
        artist_name: item.artist_name,
        album_name: item.album_name,
        popularity: item.popularity,
        discover_rating: item.discover_rating,
        track_thumbnail: item.track_thumbnail,
        claimedat: item.claimedat,
        is_favorited: userFavorites.has(item.id),
        favorite_count: countsMap.get(item.id.toString()) || 0,
    }))

    return formattedData
}
