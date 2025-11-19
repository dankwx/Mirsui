// components/MusicProphet/MusicProphetComponent.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Target, RefreshCw } from 'lucide-react'
import PredictionCard from './PredictionCard'
import ProphetStats from './ProphetStats'
import NewPredictionModal from './NewPredictionModal'
import { toast } from 'sonner'
import { BACKEND_API } from '@/lib/backendClient'

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

interface StatusMeta {
    label: string
    pillClass: string
    dotClass: string
}

const filterOptions = ['all', 'pending', 'correct', 'incorrect', 'expired'] as const

const FILTER_LABELS: Record<(typeof filterOptions)[number], string> = {
    all: 'Todas',
    pending: 'Pendentes',
    correct: 'Acertos',
    incorrect: 'Erros',
    expired: 'Expiradas'
}

export default function MusicProphetComponent({
    userData,
    predictions,
    prophetStats,
    isLoggedIn: _isLoggedIn,
    isOwnProfile
}: MusicProphetComponentProps) {
    const [showNewPredictionModal, setShowNewPredictionModal] = useState(false)
    const [filter, setFilter] = useState<(typeof filterOptions)[number]>('all')
    const [isProcessingExpired, setIsProcessingExpired] = useState(false)

    // Log ao carregar
    useEffect(() => {
        console.log('🚀 useEffect executado:', { isOwnProfile })
        console.log('📊 Previsões recebidas no componente:', predictions)
        console.log('📊 Total de previsões:', predictions.length)
        console.log('📊 Stats recebidas:', prophetStats)
        // Removi o processamento automático - use o botão "Sincronizar status"
    }, [isOwnProfile, predictions])

    const displayName = userData.display_name || userData.username

    const getStatusMeta = (status: string): StatusMeta => {
        switch (status) {
            case 'won':
            case 'correct':
                return {
                    label: 'Acertou',
                    pillClass: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
                    dotClass: 'bg-emerald-400'
                }
            case 'incorrect':
            case 'lost':
            case 'Errou':
                return {
                    label: 'Errou',
                    pillClass: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
                    dotClass: 'bg-rose-400'
                }
            case 'expired':
                return {
                    label: 'Expirou',
                    pillClass: 'border-slate-400/40 bg-slate-400/10 text-slate-200',
                    dotClass: 'bg-slate-400'
                }
            case 'pending':
                return {
                    label: 'Pendente',
                    pillClass: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
                    dotClass: 'bg-sky-400 animate-pulse'
                }
            default:
                return {
                    label: status,
                    pillClass: 'border-purple-400/40 bg-purple-400/10 text-purple-200',
                    dotClass: 'bg-purple-400'
                }
        }
    }

    const processExpiredPredictions = async () => {
        try {
            console.log('🔍 Iniciando processamento de previsões expiradas via backend...')
            setIsProcessingExpired(true)
            
            const data = await BACKEND_API.prophet.processExpired()
            console.log('📊 Dados recebidos do backend:', data)
            
            if (data.count > 0) {
                console.log(`✅ ${data.count} previsão(ões) processada(s)!`)
                toast.success(`${data.count} previsão(ões) processada(s)!`)
                
                // Mostrar notificações para cada previsão processada
                data.processed.forEach((prediction: any) => {
                    console.log('🎯 Processando previsão:', prediction)
                    if (prediction.status_result === 'won') {
                        toast.success(
                            `🎉 Acertou! "${prediction.track_title}" - +${prediction.points_result} pontos!`,
                            { duration: 5000 }
                        )
                    } else if (prediction.points_result > 0) {
                        toast.info(
                            `📈 Chegou perto! "${prediction.track_title}" - +${prediction.points_result} pontos`,
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
                toast.info('Nenhuma previsão expirada para processar')
            }
        } catch (error: any) {
            console.error('💥 Erro ao processar previsões expiradas:', error)
            toast.error(error.message || 'Erro ao processar previsões')
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
        if (filter === 'correct') {
            return prediction.status === 'correct' || prediction.status === 'won'
        }
        if (filter === 'incorrect') {
            return prediction.status === 'incorrect' || prediction.status === 'lost' || prediction.status === 'Errou'
        }
        if (filter === 'expired') {
            return prediction.status === 'expired' || prediction.is_expired
        }
        return prediction.status === filter
    })

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <header className="rounded-[32px] border border-white/10 bg-white/[0.04] px-8 py-10 shadow-[0_0_120px_rgba(132,94,255,0.18)]">
                <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-white/50">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
                            <span>music prophet</span>
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                                Profecias sonoras de {isOwnProfile ? 'você' : displayName}
                            </h1>
                            <p className="max-w-2xl text-sm text-white/70 md:text-base">
                                Um diário visual das apostas musicais que você acredita que vão explodir. Acompanhe o hype, celebre os acertos e aprenda com os quase virais.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.25em] text-white/50">
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-1">
                                {prophetStats.totalPredictions} previsões
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-1">
                                {prophetStats.correctPredictions} acertos
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-1">
                                saldo {prophetStats.netPoints > 0 ? '+' : ''}{prophetStats.netPoints}
                            </span>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <div className="flex flex-col gap-3 md:items-end">
                            <Button
                                onClick={() => setShowNewPredictionModal(true)}
                                className="flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 text-sm font-medium shadow-[0_20px_60px_rgba(137,97,255,0.35)] transition hover:from-purple-600 hover:to-pink-600"
                            >
                                <Target className="h-4 w-4" />
                                Nova previsão
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={processExpiredPredictions}
                                disabled={isProcessingExpired}
                                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-xs font-medium text-white/70 transition hover:border-white/40 hover:bg-white/[0.08]"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isProcessingExpired ? 'animate-spin' : ''}`} />
                                {isProcessingExpired ? 'Sincronizando...' : 'Sincronizar status'}
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            <ProphetStats stats={prophetStats} />

            <section className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                        linha do tempo das apostas
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {filterOptions.map((key) => {
                            const isActive = filter === key
                            const count = (() => {
                                switch (key) {
                                    case 'pending':
                                        return predictions.filter(p => p.status === 'pending').length
                                    case 'correct':
                                        return predictions.filter(p => p.status === 'correct' || p.status === 'won').length
                                    case 'incorrect':
                                        return predictions.filter(p => p.status === 'incorrect' || p.status === 'lost' || p.status === 'Errou').length
                                    case 'expired':
                                        return predictions.filter(p => p.status === 'expired' || p.is_expired).length
                                    default:
                                        return predictions.length
                                }
                            })()

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFilter(key)}
                                    className={`rounded-full border px-4 py-2 text-sm transition ${
                                        isActive
                                            ? 'border-white bg-white text-[#05030f]'
                                            : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'
                                    }`}
                                >
                                    {FILTER_LABELS[key]} ({count})
                                </button>
                            )
                        })}
                    </div>
                </div>

                {filteredPredictions.length > 0 ? (
                    <div className="relative">
                        <div className="pointer-events-none absolute left-5 top-4 bottom-6 hidden w-px bg-white/10 md:block" />
                        <ul className="space-y-6">
                            {filteredPredictions.map((prediction, index) => (
                                <PredictionCard
                                    key={prediction.prediction_id}
                                    prediction={prediction}
                                    statusMeta={getStatusMeta(prediction.status)}
                                    isLast={index === filteredPredictions.length - 1}
                                />
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.02] px-8 py-16 text-center">
                        <div className="mx-auto mb-6 h-14 w-14 rounded-full border border-white/10 bg-white/[0.08] backdrop-blur">
                            <Sparkles className="mx-auto mt-3.5 h-7 w-7 text-purple-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                            {filter === 'all' ? 'Nenhuma profecia por aqui ainda' : 'Nada encontrado nesse filtro'}
                        </h3>
                        <p className="mt-2 text-sm text-white/60">
                            {isOwnProfile && filter === 'all'
                                ? 'Escolha uma faixa que você acredita que vai viralizar e registre a profecia antes de todo mundo.'
                                : 'Quando novas previsões acontecerem, elas aparecem aqui em ordem cronológica.'}
                        </p>
                        {isOwnProfile && filter === 'all' && (
                            <Button
                                onClick={() => setShowNewPredictionModal(true)}
                                className="mt-6 rounded-full border border-white/10 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 shadow-[0_12px_40px_rgba(147,104,255,0.35)] hover:from-purple-600 hover:to-pink-600"
                            >
                                Fazer primeira previsão
                            </Button>
                        )}
                    </div>
                )}
            </section>

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