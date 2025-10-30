// components/RecentClaims/RecentClaims.tsx
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Music } from 'lucide-react'
import { RecentClaim } from '@/utils/recentClaimsService'

interface RecentClaimsProps {
    claims: RecentClaim[]
}

export default function RecentClaims({ claims }: RecentClaimsProps) {
    if (claims.length === 0) {
        return (
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Music className="h-5 w-5 text-[#4a9d6f]" />
                        Reivindicações Recentes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma reivindicação ainda
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border bg-card sticky top-8">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Music className="h-5 w-5 text-[#4a9d6f]" />
                    Reivindicações Recentes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {claims.map((claim) => (
                        <Link
                            key={claim.id}
                            href={`/track/${claim.track_url?.split('/').pop() || claim.track_title}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#4a9d6f]/10 transition-colors group"
                        >
                            {claim.track_thumbnail && (
                                <img
                                    src={claim.track_thumbnail}
                                    alt={claim.track_title}
                                    className="h-12 w-12 rounded-md shadow-sm object-cover"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-foreground truncate group-hover:text-[#4a9d6f] transition-colors">
                                    {claim.track_title}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate">
                                    {claim.artist_name}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
