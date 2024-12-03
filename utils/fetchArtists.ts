// app/api/fetchArtists.ts

import { createClient } from '@/utils/supabase/server'

export async function fetchArtists(userId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('userartistclaims')
        .select(
            `
            artist_id,
            claim_date,
            popularity_at_claim,
            artists (
                id,
                artist_name,
                artist_image_url
            )
        `
        )
        .eq('user_id', userId)
        .order('claim_date', { ascending: false })

    if (error) {
        console.error('Error fetching artists:', error)
        return []
    }

    // Flatten the artists array
    const formattedData = data.map((item: any) => ({
        artist_id: item.artist_id,
        claim_date: item.claim_date,
        popularity_at_claim: item.popularity_at_claim,
        artists: {
            id: item.artists.id,
            artist_name: item.artists.artist_name,
            artist_image_url: item.artists.artist_image_url,
        },
    }))

    return formattedData
}
