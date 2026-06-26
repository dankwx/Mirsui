import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// GET /api/stakes/[id]/snapshots → série diária de popularidade do stake (gráfico)
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const response = await fetch(
            `${BACKEND_URL}/stakes/${params.id}/snapshots`,
            {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            }
        )
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Erro ao buscar snapshots do stake:', error)
        return NextResponse.json(
            { error: 'Erro ao buscar histórico' },
            { status: 500 }
        )
    }
}
