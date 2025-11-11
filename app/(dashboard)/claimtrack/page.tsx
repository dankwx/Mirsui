import type React from 'react'
import type { Metadata } from 'next'

import { Sparkles, Disc3, ShieldCheck, Timer, TrendingUp } from 'lucide-react'
import RecentActivity from '@/components/RecentActivity/RecentActivity'
import SearchWithResults from '@/components/SearchWithResults/SearchWithResults'
import TrendingPage from '@/components/TrendingTracks/TrendingTracks'

export const metadata: Metadata = {
    title: 'Reivindicar Músicas - Mirsui',
    description: 'Descubra novas músicas e reivindique tracks antes que se tornem virais.',
}

export default function ClaimTracksPage() {
    const highlightCards = [
        {
            title: 'Descobertas semanais',
            value: '128 novas tracks',
            description: 'Selecionadas pelo Music Prophet nas últimas 24h',
            icon: Disc3,
        },
        {
            title: 'Claims bem-sucedidos',
            value: '92% taxa de acerto',
            description: 'Validado pela comunidade e curadores especialistas',
            icon: ShieldCheck,
        },
        {
            title: 'Velocidade média',
            value: '2m 37s',
            description: 'Tempo médio para reivindicar após o alerta subir',
            icon: Timer,
        },
    ]

    return (
        <div className="relative mx-auto w-full max-w-[1180px] px-6 pb-16 pt-12 md:px-10 lg:px-16">
            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(124,98,255,0.35),transparent_55%)] opacity-40 blur-3xl" />

            <div className="relative space-y-10">
                <section className="relative rounded-[26px] border border-white/8 bg-white/[0.03] p-8 shadow-[0_60px_120px_-40px_rgba(76,43,214,0.7)] backdrop-blur-2xl md:p-10">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                        <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(122,94,255,0.35)_0%,rgba(21,13,44,0.85)_55%,rgba(8,12,32,0.9)_100%)]" />
                        <div className="absolute -left-16 top-6 h-48 w-48 rounded-full bg-purple-500/30 blur-3xl" />
                        <div className="absolute -top-20 right-10 h-56 w-56 rounded-full bg-purple-400/10 blur-3xl" />
                    </div>
                    <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-xl space-y-6">
                            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
                                <Sparkles className="h-4 w-4 text-purple-200" />
                                <span>claim antes do hype</span>
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                                    Reivindique os próximos hits antes de explodirem
                                </h1>
                                <p className="text-base text-white/60 md:text-lg">
                                    Utilize os sinais do nosso Music Prophet, acompanhe o movimento da comunidade e garanta seu lugar nas próximas catapultas sonoras.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {highlightCards.map((card) => {
                                    const Icon = card.icon
                                    return (
                                        <div
                                            key={card.title}
                                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-[0_25px_50px_-30px_rgba(140,103,255,0.9)]"
                                        >
                                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(170,140,255,0.25),_transparent_65%)]" />
                                            <div className="relative space-y-2">
                                                <Icon className="h-5 w-5 text-purple-200" />
                                                <div>
                                                    <p className="text-sm font-medium text-white/60">
                                                        {card.title}
                                                    </p>
                                                    <p className="text-lg font-semibold text-white">
                                                        {card.value}
                                                    </p>
                                                    <p className="text-xs text-white/40">
                                                        {card.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="w-full max-w-xl self-stretch lg:max-w-lg">
                            <SearchWithResults />
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                    <RecentActivity />
                    <div className="space-y-8">
                        <TrendingPage />
                        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-[0_50px_100px_-60px_rgba(80,52,201,0.9)] backdrop-blur-2xl">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(98,83,255,0.2),transparent_60%)]" />
                            <div className="relative flex items-start gap-3">
                                <TrendingUp className="mt-1 h-5 w-5 text-purple-200" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white">
                                        Como funciona o Claim Track?
                                    </h3>
                                    <p className="text-sm text-white/60">
                                        Monitoramos sinais de crescimento orgânico, comportamento social e engajamento em tempo real. Combine essas pistas com o radar da comunidade para reivindicar com confiança antes que os algoritmos deem o próximo salto.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
