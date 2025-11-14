import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseCookieName } from '@/utils/supabase/cookie-helper'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// Função auxiliar para pegar o token do cookie
async function getAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const cookieName = getSupabaseCookieName()
    
    console.log('🔍 Procurando cookie:', cookieName)
    
    const cookieValue = cookieStore.get(cookieName)?.value

    if (!cookieValue) {
      console.log('❌ Cookie não encontrado')
      // Tentar todos os cookies que começam com 'sb-'
      const allCookies = cookieStore.getAll()
      console.log('📋 Cookies disponíveis:', allCookies.map(c => c.name))
      
      const sbCookie = allCookies.find(c => c.name.startsWith('sb-') && c.name.includes('auth-token'))
      if (sbCookie) {
        console.log('✅ Encontrado cookie alternativo:', sbCookie.name)
        const session = JSON.parse(sbCookie.value)
        return session.access_token || null
      }
      
      return null
    }

    console.log('✅ Cookie encontrado')
    const session = JSON.parse(cookieValue)
    return session.access_token || null
  } catch (error) {
    console.error('❌ Erro ao pegar token:', error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📤 Buscando comentários do backend:', `${BACKEND_URL}/tracks/${params.id}/comments`)
    
    const response = await fetch(`${BACKEND_URL}/tracks/${params.id}/comments`, {
      method: 'GET'
    })

    const data = await response.json()
    console.log('📥 Comentários recebidos do backend:', response.status, data)

    if (!response.ok) {
      console.error('❌ Erro ao buscar comentários:', data)
      return NextResponse.json(
        { error: data.error || 'Erro ao buscar comentários' },
        { status: response.status }
      )
    }

    // Retornar os comentários do backend
    return NextResponse.json(data.comments || [])
  } catch (error) {
    console.error('❌ Erro ao buscar comentários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAccessToken()
    console.log('🔑 Token encontrado (POST comment):', !!token)

    if (!token) {
      console.error('❌ Token não encontrado - usuário não autenticado')
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { comment_text } = await request.json()
    console.log('📤 Enviando comentário para backend:', comment_text)

    const response = await fetch(`${BACKEND_URL}/tracks/${params.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ comment: comment_text })
    })

    const data = await response.json()
    console.log('📥 Resposta do backend (POST comment):', response.status, data)

    if (!response.ok) {
      console.error('❌ Erro na resposta do backend:', data)
      return NextResponse.json(
        { error: data.error || 'Erro ao criar comentário' },
        { status: response.status }
      )
    }

    // O backend já retorna no formato correto agora
    if (data.comment) {
      console.log('✅ Comentário criado com sucesso:', data.comment)
      return NextResponse.json(data.comment)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}