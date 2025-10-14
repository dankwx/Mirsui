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
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Total de Previsões
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-foreground">
                            {formatNumber(stats.totalPredictions)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Acertos
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-green-600">
                            {formatNumber(stats.correctPredictions)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Taxa de Acerto
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-purple-600">
                            {formatPercentage(stats.accuracy)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Pontos Apostados
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-foreground">
                            {formatNumber(stats.totalPointsBet)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Pontos Ganhos
                        </span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-orange-600">
                            {formatNumber(stats.totalPointsGained)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium text-muted-foreground">
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