// components/MusicProphet/ProphetStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target, Award, Coins, Activity, Percent } from 'lucide-react'

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
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('pt-BR').format(num)
    }

    const formatPercentage = (num: number) => {
        return `${num.toFixed(1)}%`
    }

    const getNetPointsColor = (points: number) => {
        if (points > 0) return 'text-green-600'
        if (points < 0) return 'text-red-600'
        return 'text-gray-600'
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 via-white/60 to-blue-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md">
                            <Activity className="h-4 w-4 text-blue-700" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                            Total de Previsões
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-blue-900">
                            {formatNumber(stats.totalPredictions)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 via-white/60 to-green-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md">
                            <Target className="h-4 w-4 text-green-700" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                            Acertos
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-green-700">
                            {formatNumber(stats.correctPredictions)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 via-white/60 to-purple-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md">
                            <Percent className="h-4 w-4 text-purple-700" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                            Taxa de Acerto
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-purple-700">
                            {formatPercentage(stats.accuracy)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 via-white/60 to-yellow-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md">
                            <Coins className="h-4 w-4 text-yellow-700" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                            Pontos Apostados
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-yellow-900">
                            {formatNumber(stats.totalPointsBet)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 via-white/60 to-orange-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md">
                            <Award className="h-4 w-4 text-orange-700" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                            Pontos Ganhos
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-orange-700">
                            {formatNumber(stats.totalPointsGained)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500/10 via-white/60 to-indigo-400/10 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-md">
                            <TrendingUp className="h-4 w-4 text-indigo-700" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                            Saldo Líquido
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className={`text-2xl font-bold ${getNetPointsColor(stats.netPoints)}`}>
                            {stats.netPoints > 0 ? '+' : ''}{formatNumber(stats.netPoints)}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}