import { createClient } from '@/utils/supabase/server'

export async function fetchSongs(userId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('tracks')
        .select(
            `
            id,
            track_url,
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

    if (error) {
        console.error('Error fetching songs:', error)
        return []
    }

    // Format the songs array
    const formattedData = data.map((item: any) => ({
        id: item.id,
        track_url: item.track_url,
        track_title: item.track_title,
        artist_name: item.artist_name,
        album_name: item.album_name,
        popularity: item.popularity,
        discover_rating: item.discover_rating,
        track_thumbnail: item.track_thumbnail,
        claimedat: item.claimedat,
    }))

    return formattedData
}
