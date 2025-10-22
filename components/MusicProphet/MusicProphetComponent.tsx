// components/MusicProphet/MusicProphetComponent.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, Target, Clock, Award, Coins } from 'lucide-react'
import PredictionCard from './PredictionCard'
import ProphetStats from './ProphetStats'
import NewPredictionModal from './NewPredictionModal'
import { toast } from 'sonner'

interface UserData {
    id: string
    username: string
    display_name?: string
    avatar_url?: string
}

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
}

interface ProphetStats {
    totalPredictions: number
    correctPredictions: number
    totalPointsGained: number
    totalPointsBet: number
    accuracy: number
    netPoints: number
}

interface MusicProphetComponentProps {
    userData: UserData
    predictions: Prediction[]
    prophetStats: ProphetStats
    isLoggedIn: boolean
    isOwnProfile: boolean
}

export default function MusicProphetComponent({
    userData,
    predictions,
    prophetStats,
    isLoggedIn,
    isOwnProfile
}: MusicProphetComponentProps) {
    const [showNewPredictionModal, setShowNewPredictionModal] = useState(false)
    const [filter, setFilter] = useState<'all' | 'pending' | 'correct' | 'incorrect' | 'expired'>('all')
    const [isProcessingExpired, setIsProcessingExpired] = useState(false)

    // Processar previsões expiradas quando o componente carrega
    useEffect(() => {
        console.log('🚀 useEffect executado:', { isOwnProfile })
        if (isOwnProfile) {
            processExpiredPredictions()
        }
    }, [isOwnProfile])

    const processExpiredPredictions = async () => {
        try {
            console.log('🔍 Iniciando processamento de previsões expiradas...')
            setIsProcessingExpired(true)
            
            const response = await fetch('/api/predictions/process-expired', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            console.log('📡 Response status:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('📊 Dados recebidos:', data)
                
                if (data.count > 0) {
                    console.log(`✅ ${data.count} previsão(ões) processada(s)!`)
                    toast.success(`${data.count} previsão(ões) processada(s)!`)
                    
                    // Mostrar notificações para cada previsão processada
                    data.processed.forEach((prediction: any) => {
                        console.log('🎯 Processando previsão:', prediction)
                        if (prediction.new_status === 'correct') {
                            toast.success(
                                `🎉 Acertou! "${prediction.track_title}" - +${prediction.points_gained} pontos!`,
                                { duration: 5000 }
                            )
                        } else if (prediction.points_returned > 0) {
                            toast.info(
                                `📈 Chegou perto! "${prediction.track_title}" - +${prediction.points_returned} pontos`,
                                { duration: 4000 }
                            )
                        }
                    })
                    
                    // Recarregar a página após 2 segundos para mostrar as atualizações
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                } else {
                    console.log('ℹ️ Nenhuma previsão expirada para processar')
                }
            } else {
                console.error('❌ Erro na resposta:', response.status, response.statusText)
                const errorData = await response.json()
                console.error('❌ Dados do erro:', errorData)
            }
        } catch (error) {
            console.error('💥 Erro ao processar previsões expiradas:', error)
        } finally {
            setIsProcessingExpired(false)
        }
    }

    const handlePredictionCreated = () => {
        // Recarregar a página para mostrar a nova previsão
        window.location.reload()
    }

    const filteredPredictions = predictions.filter(prediction => {
        if (filter === 'all') return true
        return prediction.status === filter
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'won': return 'bg-green-100 text-green-800 border-green-200'
            case 'correct': return 'bg-green-100 text-green-800 border-green-200'
            case 'Errou': return 'bg-red-100 text-red-800 border-red-200'
            case 'incorrect': return 'bg-red-100 text-red-800 border-red-200'
            case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'won': return 'Acertou!'
            case 'correct': return 'Acertou!'
            case 'Errou': return 'Errou'
            case 'incorrect': return 'Errou'
            case 'pending': return 'Pendente'
            case 'expired': return 'Expirou'
            default: return status
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white/60 backdrop-blur-2xl rounded-3xl p-8 border border-white/60 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md shadow-lg">
                            <Sparkles className="h-8 w-8 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Music Prophet
                            </h1>
                            <p className="text-slate-600">
                                {isOwnProfile ? 'Suas previsões musicais' : `Previsões de ${userData.display_name || userData.username}`}
                            </p>
                        </div>
                    </div>
                </div>
                
                {isOwnProfile && (
                    <Button 
                        onClick={() => setShowNewPredictionModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
                    >
                        <Target className="h-4 w-4" />
                        Nova Previsão
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <ProphetStats stats={prophetStats} />

            {/* Filters */}
            <div className="flex gap-2 flex-wrap bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md' : 'bg-white/60 backdrop-blur-md hover:bg-white/80 border-white/60'}
                >
                    Todas ({predictions.length})
                </Button>
                <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('pending')}
                    className={filter === 'pending' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md' : 'bg-white/60 backdrop-blur-md hover:bg-white/80 border-white/60'}
                >
                    Pendentes ({predictions.filter(p => p.status === 'pending').length})
                </Button>
                <Button
                    variant={filter === 'correct' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('correct')}
                    className={filter === 'correct' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md' : 'bg-white/60 backdrop-blur-md hover:bg-white/80 border-white/60'}
                >
                    Acertos ({predictions.filter(p => p.status === 'correct').length})
                </Button>
                <Button
                    variant={filter === 'incorrect' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('incorrect')}
                    className={filter === 'incorrect' ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-md' : 'bg-white/60 backdrop-blur-md hover:bg-white/80 border-white/60'}
                >
                    Erros ({predictions.filter(p => p.status === 'incorrect').length})
                </Button>
                <Button
                    variant={filter === 'expired' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('expired')}
                    className={filter === 'expired' ? 'bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 shadow-md' : 'bg-white/60 backdrop-blur-md hover:bg-white/80 border-white/60'}
                >
                    Expiradas ({predictions.filter(p => p.status === 'expired').length})
                </Button>
            </div>

            {/* Predictions List */}
            <div className="space-y-4">
                {filteredPredictions.length > 0 ? (
                    filteredPredictions.map((prediction) => (
                        <PredictionCard 
                            key={prediction.prediction_id} 
                            prediction={prediction}
                            getStatusColor={getStatusColor}
                            getStatusText={getStatusText}
                        />
                    ))
                ) : (
                    <Card className="bg-white/60 backdrop-blur-2xl border-white/60 shadow-xl">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md mb-4">
                                <Sparkles className="h-12 w-12 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {filter === 'all' ? 'Nenhuma previsão ainda' : `Nenhuma previsão ${getStatusText(filter).toLowerCase()}`}
                            </h3>
                            <p className="text-slate-600 text-center max-w-md">
                                {isOwnProfile && filter === 'all' 
                                    ? 'Comece fazendo sua primeira previsão sobre uma música que vai viralizar!'
                                    : `Não há previsões ${filter === 'all' ? '' : getStatusText(filter).toLowerCase()} para mostrar.`
                                }
                            </p>
                            {isOwnProfile && filter === 'all' && (
                                <Button 
                                    onClick={() => setShowNewPredictionModal(true)}
                                    className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                                >
                                    Fazer Primeira Previsão
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* New Prediction Modal */}
            {showNewPredictionModal && (
                <NewPredictionModal
                    isOpen={showNewPredictionModal}
                    onClose={() => setShowNewPredictionModal(false)}
                    userId={userData.id}
                    onPredictionCreated={handlePredictionCreated}
                />
            )}
        </div>
    )
}