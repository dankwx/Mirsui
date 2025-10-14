// app/api/user/points/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        const supabase = createClient()

        // Verificar se o usuário está autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authData?.user) {
            return NextResponse.json(
                { message: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        // Se não foi passado userId, usar o usuário logado
        const targetUserId = userId || authData.user.id

        // Verificar se o usuário logado pode ver os pontos do usuário solicitado
        if (targetUserId !== authData.user.id) {
            return NextResponse.json(
                { message: 'Não autorizado a ver pontos de outro usuário' },
                { status: 403 }
            )
        }

        // Buscar pontos do usuário
        const { data: points, error } = await supabase
            .rpc('get_user_points', { user_uuid: targetUserId })

        if (error) {
            console.error('Erro ao buscar pontos:', error)
            return NextResponse.json(
                { message: 'Erro ao buscar pontos do usuário' },
                { status: 500 }
            )
        }

        return NextResponse.json({ 
            points: points || 0,
            userId: targetUserId 
        })

    } catch (error) {
        console.error('Erro na API de pontos:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}