import { NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// GET /api/stakes/points → total de pontos do sistema isolado de Stakes
export async function GET() {
    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const response = await fetch(`${BACKEND_URL}/stakes/points`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Erro ao buscar pontos:', error)
        return NextResponse.json({ error: 'Erro ao buscar pontos' }, { status: 500 })
    }
}
