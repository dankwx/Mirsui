import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/tracks/${params.id}/comments`, {
      method: 'GET'
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erro ao buscar comentários' },
        { status: response.status }
      )
    }

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
    const token = await getAccessToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { comment_text } = await request.json()

    if (!comment_text || typeof comment_text !== 'string' || !comment_text.trim()) {
      return NextResponse.json(
        { error: 'Comentário não pode ser vazio' },
        { status: 400 }
      )
    }

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

    return NextResponse.json(data.comment ?? data)
  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
