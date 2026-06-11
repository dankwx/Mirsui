// app/api/user/points/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
    try {
        const token = await getAccessToken()

        if (!token) {
            return NextResponse.json(
                { message: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        const response = await fetch(`${BACKEND_URL}/user/points`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { message: data.error || 'Erro ao buscar pontos' },
                { status: response.status }
            )
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error('Erro na API de pontos:', error)
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
