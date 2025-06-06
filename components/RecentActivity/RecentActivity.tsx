// components/RecentActivity.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import SearchWithResults from '../SearchWithResults/SearchWithResults'

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
    const supabase = createClient()

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
        <div className="mr-8 max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Recent Activity
            </h2>

            {claimedTracksData && claimedTracksData.length > 0 ? (
                <div className="space-y-4">
                    {claimedTracksData.map((track, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            {/* Avatar */}
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                                {track.avatar_url ? (
                                    <Image
                                        src={track.avatar_url}
                                        alt={`${track.username} avatar`}
                                        width={32}
                                        height={32}
                                        className="h-full w-full rounded-full object-cover"
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEkJNij2iYP2i4OFbLFzjbW1VTl5fwqRVWodaOyqTdZEkKGWY4jVBJBJZiLUpYLCUZDCUBjCPQTGDqIjJIZSyQlAXJAJNJzBaZTGNFMBmkZa1ZQYKGDdGSkyJQXjdJkRjdOjQjPfJmQZGWXQRASGCMJDGGJQFJkBOmCQZAKJZlBhQxAVdHHDJWPJGAGPJGAGPJGAGPJGAGPJGAGMJGAGMJGAGMJGAGMJGAGMJGAGMJGAGMJGAGMJGAGP/2Q=="
                                    />
                                ) : (
                                    <span className="text-xs font-medium text-gray-600">
                                        {track.username.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2 text-sm">
                                    <Link
                                        href={`/user/${track.username}`}
                                        className="font-medium text-gray-900 hover:underline"
                                    >
                                        {track.username}
                                    </Link>
                                    <span className="text-gray-500">
                                        reinvidicou
                                    </span>
                                    <span className="text-gray-400">
                                        {formatClaimedAt(track.claimed_at)}
                                    </span>
                                </div>

                                <div className="mt-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        <Link
                                            href={`/track/${track.track_id || track.track_title}`}
                                            className="hover:underline"
                                        >
                                            {track.track_title}
                                        </Link>{' '}
                                        by{' '}
                                        <Link
                                            href={`/artist/${track.artist_name}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {track.artist_name}
                                        </Link>
                                    </p>

                                    {track.claim_message && (
                                        <p className="mt-1 text-sm italic text-gray-600">
                                            &quot;{track.claim_message}&quot;
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">
                    Nenhuma atividade recente encontrada.
                </p>
            )}
        </div>
    )
}
