// components/Artist/TrackClaimers.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Music } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

interface TrackClaimersProps {
    trackUri: string
}

interface TrackClaimer {
    username: string
    claimed_date: string
}

// Função para calcular tempo relativo
function getRelativeTime(date: string): string {
    const now = new Date()
    const claimedDate = new Date(date)
    const diffInMs = now.getTime() - claimedDate.getTime()

    const minutes = Math.floor(diffInMs / (1000 * 60))
    const hours = Math.floor(diffInMs / (1000 * 60 * 60))
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'agora mesmo'
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
}

// Função para gerar iniciais do username
function getInitials(username: string): string {
    return username
        .split(' ')
        .map((name) => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export default async function TrackClaimers({ trackUri }: TrackClaimersProps) {
    const supabase = await createClient()

    // Busca os usuários que fizeram claim da track
    const { data: claimers, error } = await supabase.rpc(
        'get_users_by_track_uri',
        {
            p_track_uri: trackUri,
        }
    )

    if (error) {
        console.error('Erro ao buscar claimers:', error)
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Music className="h-5 w-5" />
                        Usuários que Claimaram
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">
                        Erro ao carregar dados
                    </p>
                </CardContent>
            </Card>
        )
    }

    const trackClaimers = (claimers as TrackClaimer[]) || []

    if (trackClaimers.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Music className="h-5 w-5" />
                        Usuários que Claimaram
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">
                        Nenhum usuário claimou esta track ainda
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Usuários que Claimaram ({trackClaimers.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {trackClaimers.map((claimer, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder-user.jpg`} />
                            <AvatarFallback className="text-xs">
                                {getInitials(claimer.username)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {claimer.username}
                            </p>
                            <p className="text-xs text-gray-500">
                                {getRelativeTime(claimer.claimed_date)}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
