// app/(dashboard)/user/[username]/prophet/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { fetchUserData, fetchAuthData } from '@/utils/profileService'
import MusicProphetComponent from '@/components/MusicProphet/MusicProphetComponent'
import type { Metadata } from 'next'

interface ProphetPageParams {
    params: { username: string }
}

export async function generateMetadata({
    params,
}: {
    params: { username: string }
}): Promise<Metadata> {
    const { userData, error } = await fetchUserData(params.username)
    
    if (error || !userData) {
        return {
            title: 'Usuário não encontrado - Mirsui',
            description: 'Este perfil não foi encontrado no Mirsui.',
        }
    }

    const displayName = userData.display_name || userData.username || 'Usuário'
    
    return {
        title: `${displayName} - Music Prophet | Mirsui`,
        description: `Veja as previsões musicais de ${displayName} no Mirsui. Descubra suas apostas e acertos em descobertas que viralizaram.`,
    }
}

export default async function ProphetPage({ params }: ProphetPageParams) {
    const { userData, error } = await fetchUserData(params.username)

    if (error || !userData) {
        notFound()
    }

    const authData = await fetchAuthData()
    const isLoggedIn = !!authData?.user
    const isOwnProfile = authData?.user?.id === userData.id

    // Buscar previsões do usuário diretamente do Supabase (SSR)
    const supabase = await createClient()
    
    let predictions: any[] = []
    let prophetStats = {
        totalPredictions: 0,
        correctPredictions: 0,
        totalPointsGained: 0,
        totalPointsBet: 0,
        accuracy: 0,
        netPoints: 0
    }

    try {
        console.log('🔍 Buscando previsões para user_id:', userData.id)
        
        // Buscar previsões (V2)
        const { data: predictionsData, error: predictionsError } = await supabase
            .rpc('get_user_predictions_v2', { p_user_id: userData.id })

        if (predictionsError) {
            console.error('❌ Erro ao buscar previsões:', predictionsError)
        } else {
            predictions = predictionsData || []
            console.log('✅ Previsões carregadas:', predictions.length)
            console.log('📊 Dados das previsões:', predictions)
        }

        // Buscar estatísticas (V2)
        const { data: stats, error: statsError } = await supabase
            .rpc('get_user_prediction_stats_v2', { p_user_id: userData.id })

        if (statsError) {
            console.error('❌ Erro ao buscar estatísticas:', statsError)
        } else if (stats && stats.length > 0) {
            const statsData = stats[0]
            prophetStats = {
                totalPredictions: statsData.total_predictions || 0,
                correctPredictions: statsData.correct_predictions || 0,
                totalPointsGained: statsData.total_points_earned || 0,
                totalPointsBet: statsData.total_points_bet || 0,
                accuracy: statsData.accuracy_percentage || 0,
                netPoints: statsData.net_profit || 0
            }
            console.log('✅ Estatísticas carregadas:', prophetStats)
        }
    } catch (error) {
        console.error('💥 Erro ao buscar dados do profeta:', error)
        // Usar dados padrão em caso de erro
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#05030f] font-sans text-slate-100">
            <div className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(168,124,255,0.25),_transparent_65%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,143,171,0.25),_transparent_70%)] blur-3xl" />
            <div className="relative px-6 pb-16 pt-12">
                <MusicProphetComponent
                    userData={userData}
                    predictions={predictions}
                    prophetStats={prophetStats}
                    isLoggedIn={isLoggedIn}
                    isOwnProfile={isOwnProfile}
                />
            </div>
        </div>
    )
}