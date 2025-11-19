// components/MusicProphet/PredictionCard.tsx
import { Clock, TrendingUp, Calendar, Coins } from 'lucide-react'
import Image from 'next/image'

interface Prediction {
    prediction_id: number
    track_id: number
    track_title: string
    artist_name: string
    track_thumbnail: string
    current_popularity: number
    predicted_date: string // Alterado de predicted_viral_date
    points_bet: number
    prediction_type: 'increase' | 'decrease' // Agora obrigatório
    initial_popularity: number // Agora obrigatório
    final_popularity?: number
    status: string
    points_earned: number // Alterado de points_gained
    created_at: string
    days_remaining: number // Alterado de days_until_prediction
    is_expired: boolean
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
                                <div className={`rounded-full border px-3 py-1 text-sm font-semibold ${prediction.points_earned > 0 ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : prediction.points_earned < 0 ? 'border-rose-400/40 bg-rose-400/10 text-rose-200' : 'border-slate-400/40 bg-slate-400/10 text-slate-200'}`}>
                                    {formatPoints(prediction.points_earned)} pts
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-white/70">
                        {prediction.prediction_type && (
                            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium ${
                                prediction.prediction_type === 'increase' 
                                    ? 'border-green-500/40 bg-green-500/10 text-green-200' 
                                    : 'border-red-500/40 bg-red-500/10 text-red-200'
                            }`}>
                                {prediction.prediction_type === 'increase' ? '📈 Vai Crescer' : '📉 Vai Cair'}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                            <TrendingUp className="h-4 w-4 text-white/60" />
                            Inicial {prediction.initial_popularity} → Atual {prediction.current_popularity}
                            {prediction.final_popularity && (
                                <span className="text-white/40">→ Final {prediction.final_popularity}</span>
                            )}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                            <Calendar className="h-4 w-4 text-white/60" />
                            {formatDate(prediction.predicted_date)}
                        </span>
                    </div>

                    {prediction.status === 'pending' && (
                        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-white/60">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 w-fit">
                                <Clock className="h-3.5 w-3.5 text-white/50" />
                                {getDaysText(prediction.days_remaining, prediction.status)}
                            </span>
                        </div>
                    )}
                </div>
            </article>
        </li>
    )
}