// utils/fetchTrackInfo.ts

import { createClient } from '@/utils/supabase/server'

/**
 * Fetches the count of how many times a specific Spotify track URI appears in the 'tracks' table.
 *
 * @param {string} spotifyTrackUri - The Spotify URI of the track to count.
 * @returns {Promise<number>} A promise that resolves to the number of occurrences of the track URI.
 * Returns 0 if an error occurs or no occurrences are found.
 */
export async function countTrackOccurrences(
    spotifyTrackUri: string
): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true })
        .eq('track_uri', spotifyTrackUri)

    if (error) {
        console.error('Error counting track occurrences:', error)
        return 0
    }

    return count || 0
}
