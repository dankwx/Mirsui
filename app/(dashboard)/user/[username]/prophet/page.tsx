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
            title: 'Usuário não encontrado - SoundSage',
            description: 'Este perfil não foi encontrado no SoundSage.',
        }
    }

    const displayName = userData.display_name || userData.username || 'Usuário'
    
    return {
        title: `${displayName} - Music Prophet | SoundSage`,
        description: `Veja as previsões musicais de ${displayName} no SoundSage. Descubra suas apostas e acertos em descobertas que viralizaram.`,
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

    // Buscar previsões do usuário
    const supabase = createClient()
    
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
        // Primeiro, processar previsões expiradas automaticamente
        try {
            await supabase.rpc('process_expired_predictions')
            console.log('Previsões expiradas processadas com sucesso')
        } catch (processError) {
            console.warn('Aviso ao processar previsões expiradas:', processError)
            // Continuar mesmo se houver erro no processamento
        }

        // Agora buscar as previsões atualizadas
        const { data: predictionsData, error: predictionsError } = await supabase
            .rpc('get_user_predictions', { user_uuid: userData.id })

        if (!predictionsError && predictionsData) {
            predictions = predictionsData
        }

        // Buscar estatísticas do profeta
        const { data: stats, error: statsError } = await supabase
            .from('music_predictions')
            .select('status, points_gained, points_bet')
            .eq('user_id', userData.id)

        if (stats && !statsError) {
            prophetStats = {
                totalPredictions: stats.length,
                correctPredictions: stats.filter(s => s.status === 'won').length,
                totalPointsGained: stats.reduce((sum, s) => sum + (s.points_gained || 0), 0),
                totalPointsBet: stats.reduce((sum, s) => sum + s.points_bet, 0),
                accuracy: stats.length > 0 ? (stats.filter(s => s.status === 'won').length / stats.length) * 100 : 0,
                netPoints: stats.reduce((sum, s) => sum + (s.points_gained || 0) - s.points_bet, 0)
            }
        }
    } catch (error) {
        console.error('Erro ao buscar dados do profeta:', error)
        // Usar dados padrão em caso de erro
    }

    return (
        <div className="px-6 py-6 font-sans">
            <MusicProphetComponent
                userData={userData}
                predictions={predictions}
                prophetStats={prophetStats}
                isLoggedIn={isLoggedIn}
                isOwnProfile={isOwnProfile}
            />
        </div>
    )
}