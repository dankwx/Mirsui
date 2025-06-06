// app/profile/page.tsx
import { createClient } from '@/utils/supabase/server'
import {
    ReactElement,
    JSXElementConstructor,
    ReactNode,
    ReactPortal,
    AwaitedReactNode,
    Key,
} from 'react'

export const dynamic = 'force-dynamic'

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

export default async function ProfilePage() {
    const supabase = createClient()

    const {
        data: { session },
    } = await supabase.auth.getSession()

    let claimedTracksData = null
    if (session) {
        const { data, error } = await supabase.rpc('get_claimed_tracks_details')

        if (error) {
            console.error('Error fetching claimed tracks:', error)
        } else {
            claimedTracksData = data
            console.log(claimedTracksData)
        }
    }

    return (
        <div className="container" style={{ padding: '50px 0 100px 0' }}>
            <div>
                <h1 className="mb-4 text-2xl font-bold">
                    Faixas Reivindicadas:
                </h1>
                {claimedTracksData && claimedTracksData.length > 0 ? (
                    <div className="space-y-4">
                        {claimedTracksData.map(
                            (
                                track: {
                                    track_title:
                                        | string
                                        | number
                                        | bigint
                                        | boolean
                                        | ReactElement<
                                              any,
                                              | string
                                              | JSXElementConstructor<any>
                                          >
                                        | Iterable<ReactNode>
                                        | ReactPortal
                                        | Promise<AwaitedReactNode>
                                        | null
                                        | undefined
                                    artist_name:
                                        | string
                                        | number
                                        | bigint
                                        | boolean
                                        | ReactElement<
                                              any,
                                              | string
                                              | JSXElementConstructor<any>
                                          >
                                        | Iterable<ReactNode>
                                        | ReactPortal
                                        | Promise<AwaitedReactNode>
                                        | null
                                        | undefined
                                    username:
                                        | string
                                        | number
                                        | bigint
                                        | boolean
                                        | ReactElement<
                                              any,
                                              | string
                                              | JSXElementConstructor<any>
                                          >
                                        | Iterable<ReactNode>
                                        | ReactPortal
                                        | Promise<AwaitedReactNode>
                                        | null
                                        | undefined
                                    claimed_at: string | number | Date
                                    claim_message:
                                        | string
                                        | number
                                        | bigint
                                        | boolean
                                        | ReactElement<
                                              any,
                                              | string
                                              | JSXElementConstructor<any>
                                          >
                                        | Iterable<ReactNode>
                                        | ReactPortal
                                        | Promise<AwaitedReactNode>
                                        | null
                                        | undefined
                                },
                                index: Key | null | undefined
                            ) => (
                                <div
                                    key={index}
                                    className="rounded-lg bg-gray-800 p-4 shadow-md"
                                >
                                    <p className="text-lg text-white">
                                        <span className="font-semibold">
                                            Título:
                                        </span>{' '}
                                        {track.track_title}
                                    </p>
                                    <p className="text-base text-gray-300">
                                        <span className="font-semibold">
                                            Artista:
                                        </span>{' '}
                                        {track.artist_name}
                                    </p>
                                    <p className="text-base text-gray-300">
                                        <span className="font-semibold">
                                            Reivindicado por:
                                        </span>{' '}
                                        {track.username}
                                    </p>
                                    <p className="text-base text-gray-300">
                                        <span className="font-semibold">
                                            Em:
                                        </span>{' '}
                                        {formatClaimedAt(track.claimed_at)}
                                    </p>
                                    {track.claim_message && (
                                        <p className="text-base italic text-gray-300">
                                            <span className="font-semibold">
                                                Comentário:
                                            </span>{' '}
                                            &quot;{track.claim_message}&quot;
                                        </p>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <p className="text-gray-400">
                        Nenhuma faixa reivindicada encontrada.
                    </p>
                )}
            </div>
        </div>
    )
}
