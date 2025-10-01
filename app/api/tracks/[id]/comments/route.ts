import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const trackId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    console.log('Buscando comentários para track:', trackId, 'limit:', limit, 'offset:', offset)
    
    // Buscar comentários usando query direta
    const { data, error } = await supabase
      .from('track_comments')
      .select(`
        id,
        track_id,
        user_id,
        comment_text,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('track_id', trackId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Erro ao buscar comentários:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    // Transformar os dados para o formato esperado
    const comments = (data || []).map((comment: any) => ({
      id: comment.id,
      track_id: comment.track_id,
      user_id: comment.user_id,
      comment_text: comment.comment_text,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      username: comment.profiles?.username || '',
      display_name: comment.profiles?.display_name || null,
      avatar_url: comment.profiles?.avatar_url || null
    }))
    
    console.log('Comentários encontrados:', comments.length)
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Erro interno:', error)
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
    const supabase = createClient()
    const trackId = parseInt(params.id)
    const { comment_text } = await request.json()
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    if (!comment_text || comment_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comentário não pode estar vazio' },
        { status: 400 }
      )
    }
    
    // Inserir comentário
    console.log('Inserindo comentário para track:', trackId, 'user:', user.id)
    const { data, error } = await supabase
      .from('track_comments')
      .insert({ 
        track_id: trackId,
        user_id: user.id,  // Adicionar explicitamente o user_id
        comment_text: comment_text.trim()
      })
      .select(`
        id,
        track_id,
        user_id,
        comment_text,
        created_at,
        updated_at,
        profiles:user_id (
          username,
          display_name,
          avatar_url
        )
      `)
    
    if (error) {
      console.error('Erro ao inserir comentário:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Erro ao criar comentário' },
        { status: 400 }
      )
    }
    
    // Transformar o resultado para o formato esperado
    const comment = data[0]
    const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
    const result = {
      id: comment.id,
      track_id: comment.track_id,
      user_id: comment.user_id,
      comment_text: comment.comment_text,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      username: profile?.username || '',
      display_name: profile?.display_name || null,
      avatar_url: profile?.avatar_url || null
    }
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}