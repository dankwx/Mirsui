//utils/fetchTrackInfo.ts

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
    const supabase = createClient()

    // Query the 'tracks' table, filter by 'track_uri', and get the count.
    // The select('*', { count: 'exact' }) syntax is used to get the count of matching rows.
    const { count, error } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true }) // 'head: true' makes the query faster as it doesn't return data, only the count
        .eq('track_uri', spotifyTrackUri)

    if (error) {
        console.error('Error counting track occurrences:', error)
        return 0 // Return 0 in case of an error
    }

    // Supabase returns the count as a number directly if successful.
    // If no matches, count will be 0.
    return count || 0 // Ensure it returns 0 if count is null/undefined
}
