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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const token = await getAccessToken()
    console.log('🔑 Token encontrado (DELETE comment):', !!token)

    if (!token) {
      console.error('❌ Token não encontrado - usuário não autenticado')
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    console.log('📤 Deletando comentário no backend:', `${BACKEND_URL}/comments/${params.commentId}`)

    const response = await fetch(`${BACKEND_URL}/comments/${params.commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })

    const data = await response.json()
    console.log('📥 Resposta do backend (DELETE comment):', response.status, data)

    if (!response.ok) {
      console.error('❌ Erro na resposta do backend:', data)
      return NextResponse.json(
        { error: data.error || 'Erro ao deletar comentário' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erro ao deletar comentário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}