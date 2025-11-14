import { createClient } from '@/utils/supabase/server'
import type { Song } from '@/types/profile'

export async function fetchSongs(
    userId: string,
    currentUserId?: string
): Promise<Song[]> {
    const supabase = await createClient()

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

    const trackIds = tracksData.map((track) => track.id)

    // CORREÇÃO: Buscar favoritos do DONO DO PERFIL (não do usuário logado)
    const { data: ownerFavorites, error: favError } = await supabase
        .from('favorites')
        .select('track_id')
        .eq('user_id', userId) // userId é o dono do perfil
        .in('track_id', trackIds)

    const ownerFavoritesData = favError ? [] : ownerFavorites || []

    // Buscar favoritos do usuário logado (para funcionalidade de favoritar)
    let userFavoritesData: any[] = []
    if (currentUserId) {
        const { data: userFavorites, error: userFavError } = await supabase
            .from('favorites')
            .select('track_id')
            .eq('user_id', currentUserId)
            .in('track_id', trackIds)

        if (!userFavError && userFavorites) {
            userFavoritesData = userFavorites
        }
    }

    // Criar sets para favoritos
    const ownerFavoriteSet = new Set(
        ownerFavoritesData.map((fav) => fav.track_id)
    )
    const userFavoriteSet = new Set(
        userFavoritesData.map((fav) => fav.track_id)
    )

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
        is_favorited: ownerFavoriteSet.has(item.id), // Favorito do DONO do perfil
        is_user_favorited: userFavoriteSet.has(item.id), // Favorito do usuário logado (para funcionalidade)
        favorite_count: 0, // Removido contador público
    }))

    return formattedData
}
