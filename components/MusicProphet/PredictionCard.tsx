// components/MusicProphet/PredictionCard.tsx
import { Clock, TrendingUp, Target, Calendar, Coins } from 'lucide-react'
import Image from 'next/image'

interface Prediction {
    prediction_id: number
    track_id: number
    track_title: string
    artist_name: string
    track_thumbnail: string
    current_popularity: number
    predicted_viral_date: string
    points_bet: number
    prediction_confidence: number
    target_popularity: number
    status: string
    points_gained: number
    created_at: string
    days_until_prediction: number
    is_expired: boolean
    partial_return?: boolean
    final_popularity?: number
}

interface StatusMeta {
    label: string
    pillClass: string
    dotClass: string
}

interface PredictionCardProps {
    prediction: Prediction
    statusMeta: StatusMeta
    isLast: boolean
}

export default function PredictionCard({ prediction, statusMeta, isLast }: PredictionCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const formatPoints = (points: number) => {
        if (points > 0) return `+${points}`
        return points.toString()
    }

    const getDaysText = (days: number, status: string) => {
        if (status === 'pending') {
            if (days > 0) return `${days} dias restantes`
            if (days === 0) return 'Hoje!'
            return `Expirou há ${Math.abs(days)} dias`
        }
        return null
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-emerald-300'
        if (confidence >= 60) return 'text-amber-300'
        return 'text-rose-300'
    }

    return (
        <li className="relative pl-12 md:pl-16">
            <span className={`absolute left-[1.05rem] top-9 bottom-[-1.5rem] w-px bg-white/10 md:hidden ${isLast ? 'hidden' : ''}`} />
            <span className={`absolute left-4 top-7 h-3 w-3 rounded-full ring-4 ring-[#05030f] md:left-5 ${statusMeta.dotClass}`} />
            <article className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/[0.05] p-6 transition hover:border-white/25 hover:bg-white/[0.08] md:flex-row md:items-center md:gap-8">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-white/[0.08] md:h-24 md:w-24">
                    {prediction.track_thumbnail ? (
                        <Image
                            src={prediction.track_thumbnail}
                            alt={`${prediction.track_title} cover`}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/60 to-pink-500/60">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.35em] ${statusMeta.pillClass}`}>
                                    {statusMeta.label}
                                </span>
                                <span className="text-xs text-white/50">
                                    Criado em {formatDate(prediction.created_at)}
                                </span>
                                {prediction.partial_return && prediction.status !== 'correct' && prediction.status !== 'won' && (
                                    <span className="inline-flex items-center rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-amber-200">
                                        Retorno parcial
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                                    {prediction.track_title}
                                </h3>
                                <p className="text-sm text-white/60 md:text-base">
                                    {prediction.artist_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 md:items-end">
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-white/80">
                                <Coins className="h-4 w-4 text-white/60" />
                                {prediction.points_bet} pts apostados
                            </div>
                            {prediction.status !== 'pending' && (
                                <div className={`rounded-full border px-3 py-1 text-sm font-semibold ${prediction.points_gained > 0 ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : prediction.points_gained < 0 ? 'border-rose-400/40 bg-rose-400/10 text-rose-200' : 'border-slate-400/40 bg-slate-400/10 text-slate-200'}`}>
                                    {formatPoints(prediction.points_gained)} pts
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-white/70">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                            <TrendingUp className="h-4 w-4 text-white/60" />
                            Popularidade atual {prediction.current_popularity}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                            <Target className="h-4 w-4 text-white/60" />
                            Meta {prediction.target_popularity}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                            <Calendar className="h-4 w-4 text-white/60" />
                            {formatDate(prediction.predicted_viral_date)}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                                Confiança
                                <span className={`font-semibold ${getConfidenceColor(prediction.prediction_confidence)}`}>
                                    {prediction.prediction_confidence}%
                                </span>
                            </span>
                            {prediction.status === 'pending' && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                                    <Clock className="h-3.5 w-3.5 text-white/50" />
                                    {getDaysText(prediction.days_until_prediction, prediction.status)}
                                </span>
                            )}
                        </div>
                        {prediction.final_popularity && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/70">
                                <TrendingUp className="h-3.5 w-3.5 text-white/50" />
                                Popularidade final {prediction.final_popularity}
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </li>
    )
}