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
            <Card className="sticky top-8 border border-border/70 bg-card/90 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-600/15 via-purple-500/10 to-transparent px-6 py-5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Music className="h-5 w-5 text-purple-600" />
                        Reivindicações recentes
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma reivindicação por aqui. Que tal começar as descobertas?
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="sticky top-8 overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-xl backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-transparent px-6 py-6">
                <div className="flex items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Music className="h-5 w-5 text-purple-600" />
                        Reivindicações recentes
                    </CardTitle>
                    <Link
                        href="/claimtrack"
                        className="text-xs font-semibold uppercase tracking-widest text-purple-600 hover:text-purple-700"
                    >
                        reivindicar
                    </Link>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    As últimas entradas que apareceram no radar da comunidade.
                </p>
            </CardHeader>
            <CardContent className="px-6 py-6">
                <div className="space-y-4">
                    {claims.map((claim) => (
                        <Link
                            key={claim.id}
                            href={`/track/${claim.track_url?.split('/').pop() || claim.track_title}`}
                            className="group flex items-center gap-4 rounded-2xl border border-transparent bg-muted/40 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-500/40 hover:bg-purple-600/10"
                        >
                            {claim.track_thumbnail && (
                                <img
                                    src={claim.track_thumbnail}
                                    alt={claim.track_title}
                                    className="h-12 w-12 rounded-xl object-cover shadow-sm"
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <h4 className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-purple-600">
                                    {claim.track_title}
                                </h4>
                                <p className="truncate text-xs text-muted-foreground">{claim.artist_name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
