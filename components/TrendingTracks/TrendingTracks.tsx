import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TrendingPage() {
    const supabase = createClient()

    let trendingTracksData = null

    try {
        const { data, error } = await supabase.rpc('get_rolling_trending', {
            limit_results: 20,
            min_claims: 1,
        })

        if (error) {
            console.error('Error fetching trending tracks:', error)
        } else {
            trendingTracksData = data
            console.log(trendingTracksData)
        }
    } catch (err) {
        console.error('Error calling get_rolling_trending:', err)
    }

    return (
        <div className="max-w-md rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Trending This Week
                </h2>

                {trendingTracksData && trendingTracksData.length > 0 ? (
                    <div className="space-y-3">
                        {trendingTracksData.map((track: any, index: number) => (
                            <div
                                key={track.track_uri}
                                className="flex items-center gap-3"
                            >
                                {/* Ranking Number */}
                                <div className="w-4 text-sm font-medium text-gray-500">
                                    {index + 1}
                                </div>

                                {/* Album Cover */}
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                                    {track.track_thumbnail ? (
                                        <img
                                            src={track.track_thumbnail}
                                            alt={`${track.track_title} cover`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gray-300"></div>
                                    )}
                                </div>

                                {/* Track Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium text-gray-900">
                                        {track.track_title}
                                    </div>
                                    <div className="truncate text-xs text-gray-500">
                                        {track.artist_name}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-sm font-medium text-gray-500">
                                    {Math.round(track.trending_score)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-500">
                        <p>No trending tracks available</p>
                    </div>
                )}
            </div>
        </div>
    )
}
