import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// GET /api/cravadas → lista as cravadas do usuário (proxy autenticado p/ backend)
export async function GET() {
    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const response = await fetch(`${BACKEND_URL}/cravadas`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Erro ao buscar cravadas:', error)
        return NextResponse.json({ error: 'Erro ao buscar cravadas' }, { status: 500 })
    }
}

// POST /api/cravadas → crava uma faixa
export async function POST(request: NextRequest) {
    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const response = await fetch(`${BACKEND_URL}/cravadas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        })
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Erro ao cravar faixa:', error)
        return NextResponse.json({ error: 'Erro ao cravar faixa' }, { status: 500 })
    }
}
