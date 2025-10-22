// components/MusicProphet/PredictionCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

interface PredictionCardProps {
    prediction: Prediction
    getStatusColor: (status: string) => string
    getStatusText: (status: string) => string
}

export default function PredictionCard({ 
    prediction, 
    getStatusColor, 
    getStatusText 
}: PredictionCardProps) {
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

    const getPointsColor = (points: number) => {
        if (points > 0) return 'text-green-600'
        if (points < 0) return 'text-red-600'
        return 'text-gray-600'
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
        if (confidence >= 80) return 'text-green-600'
        if (confidence >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <Card className="overflow-hidden bg-white/50 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
            <CardContent className="p-0">
                <div className="flex">
                    {/* Thumbnail da música */}
                    <div className="w-24 h-24 flex-shrink-0 relative ring-2 ring-white/50">
                        {prediction.track_thumbnail ? (
                            <Image
                                src={prediction.track_thumbnail}
                                alt={`${prediction.track_title} cover`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                <TrendingUp className="h-8 w-8 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Conteúdo da previsão */}
                    <div className="flex-1 p-4 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 truncate">
                                    {prediction.track_title}
                                </h3>
                                <p className="text-slate-600 text-sm truncate">
                                    {prediction.artist_name}
                                </p>
                                
                                <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                                    <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md px-2 py-1 rounded-full">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>Pop: {prediction.current_popularity}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md px-2 py-1 rounded-full">
                                        <Target className="h-4 w-4" />
                                        <span>Meta: {prediction.target_popularity}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md px-2 py-1 rounded-full">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(prediction.predicted_viral_date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 ml-4">
                                <Badge className={`${getStatusColor(prediction.status)} backdrop-blur-md shadow-md`}>
                                    {getStatusText(prediction.status)}
                                </Badge>
                                
                                {/* Badge de retorno parcial */}
                                {prediction.status === 'Errou' && prediction.partial_return && (
                                    <Badge variant="outline" className="bg-yellow-100/80 backdrop-blur-md text-yellow-700 border-yellow-300/50 shadow-md">
                                        <span className="text-xs">Retorno Parcial</span>
                                    </Badge>
                                )}
                                
                                <div className="flex items-center gap-1 text-sm bg-gradient-to-r from-yellow-100/80 to-amber-100/80 backdrop-blur-md px-2 py-1 rounded-full shadow-sm">
                                    <Coins className="h-4 w-4 text-yellow-700" />
                                    <span className="text-yellow-900 font-medium">{prediction.points_bet} pts</span>
                                </div>

                                {prediction.status !== 'pending' && (
                                    <div className={`text-sm font-bold ${getPointsColor(prediction.points_gained)} bg-white/60 backdrop-blur-md px-3 py-1 rounded-full shadow-md`}>
                                        {formatPoints(prediction.points_gained)} pts
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informações adicionais */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/60">
                            <div className="flex items-center gap-4 text-xs text-slate-600">
                                <span className="bg-white/60 backdrop-blur-md px-2 py-1 rounded-full">
                                    Confiança: <span className={`font-semibold ${getConfidenceColor(prediction.prediction_confidence)}`}>
                                        {prediction.prediction_confidence}%
                                    </span>
                                </span>
                                <span>
                                    Criado em {formatDate(prediction.created_at)}
                                </span>
                            </div>

                            {prediction.status === 'pending' && (
                                <div className="flex items-center gap-1 text-xs bg-white/60 backdrop-blur-md px-2 py-1 rounded-full">
                                    <Clock className="h-3 w-3" />
                                    <span className={prediction.is_expired ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                                        {getDaysText(prediction.days_until_prediction, prediction.status)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}