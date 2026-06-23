import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// POST /api/stakes/[id]/recolher → recolhe (coleta pontos se >= 7 dias, senão só remove)
export async function POST(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const response = await fetch(
            `${BACKEND_URL}/stakes/${params.id}/recolher`,
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            }
        )
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Erro ao recolher stake:', error)
        return NextResponse.json({ error: 'Erro ao recolher stake' }, { status: 500 })
    }
}
