// app/api/claim-track/route.ts

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

export async function POST(request: NextRequest) {
    try {
        const token = getAccessToken()

        if (!token) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        const body = await request.json()

        const response = await fetch(`${BACKEND_URL}/tracks/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Erro ao reivindicar música' },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Erro na API claim-track:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// GET para verificar status de reivindicação
export async function GET(request: NextRequest) {
    try {
        const token = getAccessToken()

        if (!token) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const trackUri = searchParams.get('trackUri')

        if (!trackUri) {
            return NextResponse.json(
                { error: 'trackUri é obrigatório' },
                { status: 400 }
            )
        }

        const response = await fetch(`${BACKEND_URL}/tracks/claim/status?trackUri=${encodeURIComponent(trackUri)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Erro ao verificar claim' },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Erro ao verificar reivindicação:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
