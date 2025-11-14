// app/api/user/points/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseCookieName } from '@/utils/supabase/cookie-helper'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// Função auxiliar para pegar o token do cookie
function getAccessToken(): string | null {
    try {
        const cookieStore = cookies()
        const cookieName = getSupabaseCookieName()
        const cookieValue = cookieStore.get(cookieName)?.value

        if (!cookieValue) return null

        const session = JSON.parse(cookieValue)
        return session.access_token || null
    } catch (error) {
        console.error('Erro ao pegar token:', error)
        return null
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = getAccessToken()

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