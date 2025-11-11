// components/RecentClaims/RecentClaims.tsx
import Link from 'next/link'
import { Music, Sparkles } from 'lucide-react'
import { RecentClaim } from '@/utils/recentClaimsService'

interface RecentClaimsProps {
    claims: RecentClaim[]
}

export default function RecentClaims({ claims }: RecentClaimsProps) {
    if (claims.length === 0) {
        return (
            <section className="space-y-5 rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-9 text-center text-sm text-white/60 shadow-[0_18px_42px_rgba(8,4,20,0.32)] backdrop-blur-2xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                    <Music className="h-6 w-6 text-purple-300" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Nada reivindicado ainda</h3>
                    <p>Assim que a comunidade cravar novas apostas, elas aparecem aqui.</p>
                </div>
                <Link
                    href="/claimtrack"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_12px_35px_rgba(137,97,255,0.35)] hover:from-purple-600 hover:to-pink-600"
                >
                    <Sparkles className="h-4 w-4" />
                    fazer primeira claim
                </Link>
            </section>
        )
    }

    return (
        <section className="space-y-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-white shadow-[0_18px_42px_rgba(8,4,20,0.32)] backdrop-blur-2xl">
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                        <Music className="h-4 w-4 text-purple-300" />
                        Reivindicações recentes
                    </h2>
                    <Link
                        href="/claimtrack"
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:border-white/25 hover:text-white"
                    >
                        ver tudo
                    </Link>
                </div>
                <p className="text-xs text-white/55">
                    As últimas faixas capturadas pela comunidade antes de virarem tendência.
                </p>
            </header>
            <ul className="space-y-3.5">
                {claims.map((claim) => (
                    <li key={claim.id}>
                        <Link
                            href={`/track/${claim.track_url?.split('/').pop() || claim.track_title}`}
                            className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-white/20 hover:bg-white/[0.08]"
                        >
                            {claim.track_thumbnail ? (
                                <img
                                    src={claim.track_thumbnail}
                                    alt={claim.track_title}
                                    className="h-12 w-12 rounded-xl object-cover shadow-[0_10px_24px_rgba(10,6,24,0.4)]"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-semibold text-white transition group-hover:text-purple-200">
                                    {claim.track_title}
                                </h3>
                                <p className="truncate text-xs text-white/50">{claim.artist_name}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
