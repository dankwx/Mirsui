import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// GET /api/stakes → lista os stakes do usuário (proxy autenticado p/ backend)
export async function GET() {
    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const response = await fetch(`${BACKEND_URL}/stakes`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Erro ao buscar stakes:', error)
        return NextResponse.json({ error: 'Erro ao buscar stakes' }, { status: 500 })
    }
}

// POST /api/stakes → dá stake numa faixa
export async function POST(request: NextRequest) {
    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const response = await fetch(`${BACKEND_URL}/stakes`, {
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
        console.error('Erro ao dar stake na faixa:', error)
        return NextResponse.json({ error: 'Erro ao dar stake na faixa' }, { status: 500 })
    }
}
