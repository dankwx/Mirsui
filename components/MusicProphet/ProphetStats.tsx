// components/MusicProphet/ProphetStats.tsx
import { TrendingUp, Target, Coins, Percent } from 'lucide-react'

interface ProphetStatsProps {
    stats: {
        totalPredictions: number
        correctPredictions: number
        totalPointsGained: number
        totalPointsBet: number
        accuracy: number
        netPoints: number
    }
}

export default function ProphetStats({ stats }: ProphetStatsProps) {
    const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(num)
    const formatPercentage = (num: number) => `${num.toFixed(1)}%`

    const netLabel = stats.netPoints > 0 ? `+${formatNumber(stats.netPoints)} pts` : `${formatNumber(stats.netPoints)} pts`

    const items = [
        {
            title: 'Taxa de acerto',
            value: formatPercentage(stats.accuracy || 0),
            description: `${formatNumber(stats.correctPredictions)} de ${formatNumber(stats.totalPredictions)} apostas renderam hype`,
            icon: Percent,
            glow: 'from-emerald-400/25'
        },
        {
            title: 'Saldo líquido',
            value: netLabel,
            description: `${formatNumber(stats.totalPointsGained)} ganhos • ${formatNumber(stats.totalPointsBet)} apostados`,
            icon: TrendingUp,
            glow: stats.netPoints >= 0 ? 'from-purple-400/25' : 'from-rose-400/25'
        },
        {
            title: 'Pontos ganhos',
            value: `${formatNumber(stats.totalPointsGained)} pts`,
            description: 'Recompensas acumuladas quando o palpite virou realidade',
            icon: Coins,
            glow: 'from-amber-400/25'
        },
        {
            title: 'Apostas certeiras',
            value: `${formatNumber(stats.correctPredictions)} hits`,
            description: `${formatNumber(stats.totalPredictions)} profecias registradas até agora`,
            icon: Target,
            glow: 'from-sky-400/25'
        }
    ]

    return (
        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {items.map(({ title, value, description, icon: Icon, glow }) => (
                    <article
                        key={title}
                        className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.05] p-6 transition hover:border-white/25 hover:bg-white/[0.08]"
                    >
                        <div className={`pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl`} />
                        <div className="relative flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/50">
                                <Icon className="h-4 w-4 text-white/60" />
                                <span>{title}</span>
                            </div>
                            <span className="text-2xl font-semibold text-white md:text-3xl">{value}</span>
                            <p className="text-xs text-white/60 md:text-sm">{description}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}