// components/MusicProphet/NewPredictionModal.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { X, Calendar, Target, Coins, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import MusicSearchForPrediction from './MusicSearchForPrediction'
import { BACKEND_API } from '@/lib/backendClient'

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
    const [predictionType, setPredictionType] = useState<'increase' | 'decrease'>('increase')
    const [isLoading, setIsLoading] = useState(false)
    const [userPoints, setUserPoints] = useState<number | null>(null)
    const [loadingPoints, setLoadingPoints] = useState(false)

    // Buscar pontos do usuário quando o modal abrir
    const fetchUserPoints = useCallback(async () => {
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
    }, [userId, loadingPoints, pointsBet])

    // Buscar pontos quando abrir o modal (apenas uma vez)
    React.useEffect(() => {
        if (isOpen && userPoints === null && !loadingPoints) {
            fetchUserPoints()
        }
    }, [isOpen, userPoints, loadingPoints, fetchUserPoints])

    if (!isOpen) return null

    const resetForm = () => {
        setSelectedTrack(null)
        setPredictedDate('')
        setPointsBet([100])
        setPredictionType('increase')
        setUserPoints(null)
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const handleTrackSelect = (track: SpotifyTrack | null) => {
        setSelectedTrack(track)
    }

    const handlePredictionTypeChange = (type: 'increase' | 'decrease') => {
        setPredictionType(type)
    }

    const handleSubmit = async () => {
        console.log('🎯 handleSubmit chamado!', { selectedTrack, predictedDate, pointsBet, userPoints, userId })
        
        if (!selectedTrack) {
            console.log('❌ Erro: Nenhuma música selecionada')
            toast.error('Selecione uma música para fazer a previsão')
            return
        }

        if (!predictedDate) {
            console.log('❌ Erro: Nenhuma data selecionada')
            toast.error('Selecione uma data para sua previsão')
            return
        }

        const selectedDate = new Date(predictedDate)
        const today = new Date()
        const maxDate = new Date(today.getTime() + (365 * 24 * 60 * 60 * 1000)) // 1 ano

        console.log('📅 Validando datas:', { selectedDate, today, maxDate })

        if (selectedDate <= today) {
            console.log('❌ Erro: Data no passado')
            toast.error('A data deve ser no futuro')
            return
        }

        if (selectedDate > maxDate) {
            console.log('❌ Erro: Data muito distante')
            toast.error('A data não pode ser mais de 1 ano no futuro')
            return
        }

        if (pointsBet[0] > (userPoints || 0)) {
            console.log('❌ Erro: Pontos insuficientes')
            toast.error(`Você não tem pontos suficientes. Saldo atual: ${userPoints || 0} pontos`)
            return
        }

        console.log('✅ Todas as validações passaram, iniciando requisição...')
        setIsLoading(true)

        try {
            const requestBody = {
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
                predictionConfidence: 50,
                predictionType: predictionType,
                targetPopularity: null,
                initialPopularity: selectedTrack.popularity
            }
            
            console.log('📤 Enviando requisição para backend:', requestBody)
            
            const result = await BACKEND_API.prophet.createPrediction(requestBody)
            
            console.log('✅ Sucesso:', result)
            toast.success('Previsão criada com sucesso! 🔮')
            handleClose()
            if (onPredictionCreated) {
                onPredictionCreated()
            }
        } catch (error: any) {
            console.error('💥 Erro ao criar previsão:', error)
            toast.error(error.message || 'Erro ao criar previsão')
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
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
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
                <CardContent className="space-y-6 flex-1 overflow-y-auto">
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
                            {/* Tipo de Previsão */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Tipo de Previsão
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handlePredictionTypeChange('increase')}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            predictionType === 'increase'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-green-300'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">📈</div>
                                        <div className="font-semibold">Vai Crescer</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Popularidade vai aumentar
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePredictionTypeChange('decrease')}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            predictionType === 'decrease'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 hover:border-red-300'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">📉</div>
                                        <div className="font-semibold">Vai Cair</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Popularidade vai diminuir
                                        </div>
                                        <div className="text-xs font-semibold text-red-600 mt-1">
                                            +30% bônus
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Data da Previsão */}
                            <div className="space-y-2">
                                <Label htmlFor="predicted-date" className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Data limite da previsão
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

                            {/* Aviso sobre recompensa */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-sm text-center text-gray-700">
                                    <span className="font-semibold">💡 Como funciona:</span><br/>
                                    Os pontos ganhos serão calculados pela diferença de popularidade na data escolhida!<br/>
                                    <span className="text-xs text-gray-600 mt-1 block">
                                        {predictionType === 'increase' && '📈 Quanto mais crescer, mais pontos você ganha!'}
                                        {predictionType === 'decrease' && '📉 Quanto mais cair, mais pontos você ganha! (+30% bônus)'}
                                    </span>
                                </p>
                            </div>


                        </>
                    )}

                    {/* Botões */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={() => {
                                console.log('🖱️ Botão "Fazer Previsão" clicado!')
                                handleSubmit()
                            }}
                            disabled={
                                !selectedTrack || 
                                !predictedDate || 
                                isLoading
                            }
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