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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/tracks/${params.id}/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erro ao buscar comentários' },
        { status: response.status }
      )
    }

    // Retornar os comentários do backend
    return NextResponse.json(data.comments || [])
  } catch (error) {
    console.error('Erro ao buscar comentários:', error)
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
    const token = getAccessToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { comment_text } = await request.json()

    const response = await fetch(`${BACKEND_URL}/tracks/${params.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ comment: comment_text })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erro ao criar comentário' },
        { status: response.status }
      )
    }

    // Transformar para o formato esperado pelo frontend (se necessário)
    if (data.comment) {
      const comment = data.comment
      const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
      return NextResponse.json({
        id: comment.id,
        track_id: params.id,
        user_id: comment.user_id,
        comment_text: comment.comment_text,
        created_at: comment.created_at,
        updated_at: comment.created_at,
        username: profile?.username || '',
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null
      })
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