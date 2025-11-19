// utils/musicProphetService.ts
import { createClient } from '@/utils/supabase/client'

export interface CreatePredictionData {
    trackId: number
    predictedViralDate: string
    pointsBet: number
    predictionConfidence: number
    predictionType: 'increase' | 'decrease'
    targetPopularity: number
    initialPopularity: number
}

export interface PredictionStats {
    totalPredictions: number
    correctPredictions: number
    totalPointsGained: number
    totalPointsBet: number
    accuracy: number
    netPoints: number
}

export class MusicProphetService {
    private supabase = createClient()

    async getUserPredictions(userId: string) {
        try {
            const { data, error } = await this.supabase
                .rpc('get_user_predictions_v2', { p_user_id: userId })

            if (error) {
                console.error('Erro ao buscar previsões:', error)
                return { predictions: [], error }
            }

            return { predictions: data || [], error: null }
        } catch (error) {
            console.error('Erro na busca de previsões:', error)
            return { predictions: [], error }
        }
    }

    async getUserPredictionStats(userId: string): Promise<{ stats: PredictionStats, error: any }> {
        try {
            const { data, error } = await this.supabase
                .rpc('get_user_prediction_stats_v2', { p_user_id: userId })

            if (error || !data || data.length === 0) {
                console.error('Erro ao buscar estatísticas:', error)
                return { 
                    stats: {
                        totalPredictions: 0,
                        correctPredictions: 0,
                        totalPointsGained: 0,
                        totalPointsBet: 0,
                        accuracy: 0,
                        netPoints: 0
                    }, 
                    error 
                }
            }

            // A função RPC já retorna as stats calculadas
            const statsData = data[0]
            const predictionStats: PredictionStats = {
                totalPredictions: statsData.total_predictions || 0,
                correctPredictions: statsData.correct_predictions || 0,
                totalPointsGained: statsData.total_points_earned || 0,
                totalPointsBet: statsData.total_points_bet || 0,
                accuracy: statsData.accuracy_percentage || 0,
                netPoints: statsData.net_profit || 0
            }

            return { stats: predictionStats, error: null }
        } catch (error) {
            console.error('Erro no cálculo de estatísticas:', error)
            return { 
                stats: {
                    totalPredictions: 0,
                    correctPredictions: 0,
                    totalPointsGained: 0,
                    totalPointsBet: 0,
                    accuracy: 0,
                    netPoints: 0
                }, 
                error 
            }
        }
    }

    async createPrediction(userId: string, predictionData: CreatePredictionData) {
        try {
            const { data, error } = await this.supabase
                .from('music_predictions')
                .insert({
                    user_id: userId,
                    track_id: predictionData.trackId,
                    predicted_viral_date: predictionData.predictedViralDate,
                    points_bet: predictionData.pointsBet,
                    prediction_confidence: predictionData.predictionConfidence,
                    prediction_type: predictionData.predictionType,
                    target_popularity: predictionData.targetPopularity,
                    initial_popularity: predictionData.initialPopularity
                })
                .select()
                .single()

            if (error) {
                console.error('Erro ao criar previsão:', error)
                return { prediction: null, error }
            }

            return { prediction: data, error: null }
        } catch (error) {
            console.error('Erro na criação de previsão:', error)
            return { prediction: null, error }
        }
    }

    async updatePredictionStatus(predictionId: number, status: string, pointsGained?: number) {
        try {
            const updateData: any = { status }
            if (pointsGained !== undefined) {
                updateData.points_gained = pointsGained
            }

            const { data, error } = await this.supabase
                .from('music_predictions')
                .update(updateData)
                .eq('id', predictionId)
                .select()
                .single()

            if (error) {
                console.error('Erro ao atualizar previsão:', error)
                return { prediction: null, error }
            }

            return { prediction: data, error: null }
        } catch (error) {
            console.error('Erro na atualização de previsão:', error)
            return { prediction: null, error }
        }
    }

    async updateExpiredPredictions() {
        try {
            const { error } = await this.supabase
                .rpc('update_expired_predictions')

            if (error) {
                console.error('Erro ao atualizar previsões expiradas:', error)
                return { error }
            }

            return { error: null }
        } catch (error) {
            console.error('Erro na atualização de expiradas:', error)
            return { error }
        }
    }
}

export const musicProphetService = new MusicProphetService()