import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken()

    if (!token) {
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200 }
      )
    }

    // Verificar token no backend
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      user: data.user,
      profile: data.profile,
      authenticated: true
    })
  } catch (error) {
    console.error('Erro ao verificar usuário:', error)
    return NextResponse.json(
      { user: null, authenticated: false },
      { status: 200 }
    )
  }
}
