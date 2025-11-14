import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TrendingPage() {
    const supabase = await createClient()

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
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white shadow-[0_35px_80px_-45px_rgba(82,58,204,0.9)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(144,118,255,0.22),transparent_60%)]" />
            <div className="relative">
                <h2 className="mb-5 text-lg font-semibold text-white">
                    Trending desta semana
                </h2>

                {trendingTracksData && trendingTracksData.length > 0 ? (
                    <div className="space-y-4">
                        {trendingTracksData.map((track: any, index: number) => (
                            <div
                                key={track.track_uri}
                                className="flex items-center gap-4 rounded-2xl bg-white/5 p-3 transition-colors duration-200 hover:bg-white/10"
                            >
                                {/* Ranking Number */}
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-purple-200">
                                    {index + 1}
                                </div>

                                {/* Album Cover */}
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
                                    {track.track_thumbnail ? (
                                        <img
                                            src={track.track_thumbnail}
                                            alt={`${track.track_title} cover`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-white/40">
                                            —
                                        </div>
                                    )}
                                </div>

                                {/* Track Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold text-white">
                                        {track.track_title}
                                    </div>
                                    <div className="truncate text-xs text-white/50">
                                        {track.artist_name}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                                    <span>{Math.round(track.trending_score)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center text-sm text-white/50">
                        Nenhuma faixa em tendência por enquanto.
                    </div>
                )}
            </div>
        </div>
    )
}
