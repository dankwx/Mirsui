// components/RecentActivity.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

interface ClaimedTrack {
    track_title: string
    artist_name: string
    username: string
    avatar_url: string
    claimed_at: string
    claim_message?: string
    track_id?: string
}

// Helper function to format the time
function formatClaimedAt(timestamp: string | number | Date): string {
    const now = new Date()
    const claimedDate = new Date(timestamp)
    const diffInSeconds = Math.floor(
        (now.getTime() - claimedDate.getTime()) / 1000
    )

    const minutes = Math.floor(diffInSeconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (diffInSeconds < 60) {
        return 'agora mesmo'
    } else if (minutes < 60) {
        return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`
    } else if (hours < 24) {
        return `${hours} hora${hours > 1 ? 's' : ''} atrás`
    } else if (days < 7) {
        return `${days} dia${days > 1 ? 's' : ''} atrás`
    } else {
        return claimedDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }
}

export default async function RecentActivity() {
    const supabase = await createClient()

    const {
        data: { session },
    } = await supabase.auth.getSession()

    let claimedTracksData: ClaimedTrack[] = []

    if (session) {
        const { data, error } = await supabase.rpc('get_claimed_tracks_details')

        if (error) {
            console.error('Error fetching claimed tracks:', error)
        } else {
            claimedTracksData = data || []
        }
    }

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-white shadow-[0_40px_80px_-50px_rgba(90,64,214,0.9)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(162,132,255,0.22),transparent_60%)]" />
            <div className="relative">
                <h2 className="mb-6 text-xl font-semibold text-white">
                    Atividade recente
                </h2>

                {claimedTracksData && claimedTracksData.length > 0 ? (
                    <div className="space-y-5">
                        {claimedTracksData.map((track, index) => (
                            <div key={index} className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
                                    {track.avatar_url ? (
                                        <Image
                                            src={track.avatar_url}
                                            alt={`${track.username} avatar`}
                                            width={36}
                                            height={36}
                                            className="h-full w-full object-cover"
                                            placeholder="blur"
                                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEkJNij2iYP2i4OFbLFzjbW1VTl5fwqRVWodaOyqTdZEkKGWY4jVBJBJZiLUpYLCUZDCUBjCPQTGDqIjJIZSyQlAXJAJNJzBaZTGNFMBmkZa1ZQYKGDdGSkyJQXjdJkRjdOjQjPfJmQZGWXQRASGCMJDGGJQFJkBOmCQZAKJZlBhQxAVdHHDJWPJGAGPJGAGPJGAGPJGAGPJGAGMJGAGMJGAGMJGAGMJGAGMJGAGMJGAGMJGAGMJGAGP/2Q=="
                                        />
                                    ) : (
                                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                                            {track.username.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                                        <Link
                                            href={`/user/${track.username}`}
                                            className="font-semibold text-white hover:text-purple-200"
                                        >
                                            {track.username}
                                        </Link>
                                        <span>reivindicou</span>
                                        <span className="text-white/40">
                                            {formatClaimedAt(track.claimed_at)}
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <p className="text-sm font-semibold text-white">
                                            <Link
                                                href={`/track/${track.track_id || track.track_title}`}
                                                className="hover:text-purple-200"
                                            >
                                                {track.track_title}
                                            </Link>{' '}
                                            <span className="text-white/50">por</span>{' '}
                                            <Link
                                                href={`/artist/${track.artist_name}`}
                                                className="text-purple-200 hover:text-purple-100"
                                            >
                                                {track.artist_name}
                                            </Link>
                                        </p>

                                        {track.claim_message && (
                                            <p className="mt-1 text-sm italic text-white/60">
                                                &quot;{track.claim_message}&quot;
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-white/50">
                        Nenhuma atividade recente encontrada.
                    </p>
                )}
            </div>
        </div>
    )
}
