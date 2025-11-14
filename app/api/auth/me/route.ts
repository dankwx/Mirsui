import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseCookieName } from '@/utils/supabase/cookie-helper'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// Função auxiliar para pegar o token do cookie
async function getAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const cookieName = getSupabaseCookieName()
    
    const cookieValue = cookieStore.get(cookieName)?.value

    if (!cookieValue) {
      // Tentar todos os cookies que começam com 'sb-'
      const allCookies = cookieStore.getAll()
      const sbCookie = allCookies.find(c => c.name.startsWith('sb-') && c.name.includes('auth-token'))
      
      if (sbCookie) {
        const session = JSON.parse(sbCookie.value)
        return session.access_token || null
      }
      
      return null
    }

    const session = JSON.parse(cookieValue)
    return session.access_token || null
  } catch (error) {
    console.error('Erro ao pegar token:', error)
    return null
  }
}

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
