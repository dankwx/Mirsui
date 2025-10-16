// components/MusicProphet/NewPredictionModal.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { X, Calendar, Target, Coins, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import MusicSearchForPrediction from './MusicSearchForPrediction'

interface SpotifyTrack {
    album: {
        name: string
        images: { url: string }[]
        release_date: string
    }
    artists: { name: string }[]
    name: string
    popularity: number
    uri: string
    duration_ms: number
    id: string
}

interface NewPredictionModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    onPredictionCreated?: () => void
}

export default function NewPredictionModal({ 
    isOpen, 
    onClose, 
    userId,
    onPredictionCreated
}: NewPredictionModalProps) {
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null)
    const [predictedDate, setPredictedDate] = useState('')
    const [pointsBet, setPointsBet] = useState([100])
    const [confidence, setConfidence] = useState([75])
    const [targetPopularity, setTargetPopularity] = useState([70])
    const [isLoading, setIsLoading] = useState(false)
    const [userPoints, setUserPoints] = useState<number | null>(null)
    const [loadingPoints, setLoadingPoints] = useState(false)

    if (!isOpen) return null

    // Buscar pontos do usuário quando o modal abrir
    const fetchUserPoints = async () => {
        if (!userId || loadingPoints) return
        
        setLoadingPoints(true)
        try {
            const response = await fetch(`/api/user/points?userId=${userId}`)
            if (response.ok) {
                const data = await response.json()
                setUserPoints(data.points)
                // Ajustar pontos máximos baseado no saldo
                if (data.points < pointsBet[0]) {
                    setPointsBet([Math.min(data.points, 100)])
                }
            }
        } catch (error) {
            console.error('Erro ao buscar pontos:', error)
        } finally {
            setLoadingPoints(false)
        }
    }

    // Buscar pontos quando abrir o modal (apenas uma vez)
    React.useEffect(() => {
        if (isOpen && userPoints === null && !loadingPoints) {
            fetchUserPoints()
        }
    }, [isOpen])

    const resetForm = () => {
        setSelectedTrack(null)
        setPredictedDate('')
        setPointsBet([100])
        setConfidence([75])
        setTargetPopularity([70])
        setUserPoints(null)
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const calculateEstimatedReturn = () => {
        const basePoints = pointsBet[0]
        const confidenceMultiplier = 2.0 - (confidence[0] / 100.0)
        const estimatedReturn = Math.round(basePoints * confidenceMultiplier)
        return estimatedReturn
    }

    const handleTrackSelect = (track: SpotifyTrack | null) => {
        setSelectedTrack(track)
        if (track) {
            // Sugerir meta de popularidade baseada na popularidade atual
            const suggestedTarget = Math.min(track.popularity + 20, 100)
            setTargetPopularity([suggestedTarget])
        }
    }

    const handleSubmit = async () => {
        if (!selectedTrack) {
            toast.error('Selecione uma música para fazer a previsão')
            return
        }

        if (!predictedDate) {
            toast.error('Selecione uma data para sua previsão')
            return
        }

        const selectedDate = new Date(predictedDate)
        const today = new Date()
        const maxDate = new Date(today.getTime() + (365 * 24 * 60 * 60 * 1000)) // 1 ano

        if (selectedDate <= today) {
            toast.error('A data deve ser no futuro')
            return
        }

        if (selectedDate > maxDate) {
            toast.error('A data não pode ser mais de 1 ano no futuro')
            return
        }

        if (pointsBet[0] > (userPoints || 0)) {
            toast.error(`Você não tem pontos suficientes. Saldo atual: ${userPoints || 0} pontos`)
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/predictions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: selectedTrack.id,
                    trackData: {
                        track_title: selectedTrack.name,
                        artist_name: selectedTrack.artists[0]?.name || 'Unknown',
                        album_name: selectedTrack.album.name,
                        popularity: selectedTrack.popularity,
                        track_thumbnail: selectedTrack.album.images[0]?.url || null,
                        track_uri: selectedTrack.uri
                    },
                    predictedViralDate: predictedDate,
                    pointsBet: pointsBet[0],
                    predictionConfidence: confidence[0],
                    targetPopularity: targetPopularity[0]
                })
            })

            if (response.ok) {
                toast.success('Previsão criada com sucesso! 🔮')
                handleClose()
                if (onPredictionCreated) {
                    onPredictionCreated()
                }
            } else {
                const error = await response.json()
                toast.error(error.message || 'Erro ao criar previsão')
            }
        } catch (error) {
            console.error('Erro ao criar previsão:', error)
            toast.error('Erro ao criar previsão')
        } finally {
            setIsLoading(false)
        }
    }

    const getConfidenceLabel = (value: number) => {
        if (value >= 90) return 'Muito Confiante'
        if (value >= 70) return 'Confiante'
        if (value >= 50) return 'Moderado'
        if (value >= 30) return 'Pouco Confiante'
        return 'Apostando no Escuro'
    }

    const getConfidenceColor = (value: number) => {
        if (value >= 80) return 'text-green-600'
        if (value >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Nova Previsão Musical
                        {userPoints !== null && (
                            <div className="ml-auto flex items-center gap-1 text-sm font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                <Coins className="h-4 w-4" />
                                {userPoints} pts
                            </div>
                        )}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="h-6 w-6 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Busca de Música */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Escolha a Música</Label>
                        <MusicSearchForPrediction 
                            onTrackSelect={handleTrackSelect}
                            selectedTrack={selectedTrack}
                        />
                    </div>

                    {selectedTrack && (
                        <>
                            {/* Data da Previsão */}
                            <div className="space-y-2">
                                <Label htmlFor="predicted-date" className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Quando vai viralizar?
                                </Label>
                                <Input
                                    id="predicted-date"
                                    type="date"
                                    value={predictedDate}
                                    onChange={(e) => setPredictedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                    className="w-full"
                                />
                            </div>

                            {/* Meta de Popularidade */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Meta de Popularidade (atual: {selectedTrack.popularity})
                                </Label>
                                <div className="px-2">
                                    <Slider
                                        value={targetPopularity}
                                        onValueChange={setTargetPopularity}
                                        max={100}
                                        min={Math.max(selectedTrack.popularity + 1, 1)}
                                        step={1}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>{Math.max(selectedTrack.popularity + 1, 1)}</span>
                                        <span className="font-medium">{targetPopularity[0]}</span>
                                        <span>100</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pontos para Apostar */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Coins className="h-4 w-4" />
                                    Pontos para Apostar
                                </Label>
                                <div className="px-2">
                                    <Slider
                                        value={pointsBet}
                                        onValueChange={setPointsBet}
                                        max={Math.min(1000, userPoints || 1000)}
                                        min={10}
                                        step={10}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>10</span>
                                        <span className={`font-medium ${pointsBet[0] > (userPoints || 0) ? 'text-red-600' : 'text-yellow-600'}`}>
                                            {pointsBet[0]} pontos
                                        </span>
                                        <span>{Math.min(1000, userPoints || 1000)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Nível de Confiança */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Nível de Confiança</Label>
                                <div className="px-2">
                                    <Slider
                                        value={confidence}
                                        onValueChange={setConfidence}
                                        max={100}
                                        min={1}
                                        step={1}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>1%</span>
                                        <span className={`font-medium ${getConfidenceColor(confidence[0])}`}>
                                            {confidence[0]}% - {getConfidenceLabel(confidence[0])}
                                        </span>
                                        <span>100%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    ⚡ Menor confiança = maior recompensa se acertar!
                                </p>
                            </div>

                            {/* Estimativa de Retorno */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Retorno Estimado</p>
                                        <p className="text-xs text-muted-foreground">Se sua previsão estiver correta</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">
                                            +{calculateEstimatedReturn()} pts
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {Math.round(((calculateEstimatedReturn() - pointsBet[0]) / pointsBet[0]) * 100)}% lucro
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Botões */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={!selectedTrack || !predictedDate || isLoading}
                            className="min-w-[120px]"
                        >
                            {isLoading ? 'Criando...' : 'Fazer Previsão'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}