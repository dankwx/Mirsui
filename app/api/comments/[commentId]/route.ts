import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const supabase = createClient()
    const commentId = parseInt(params.commentId)
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    // Verificar se o comentário pertence ao usuário
    const { data: comment, error: fetchError } = await supabase
      .from('track_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()
    
    if (fetchError || !comment) {
      return NextResponse.json(
        { error: 'Comentário não encontrado' },
        { status: 404 }
      )
    }
    
    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Não autorizado a deletar este comentário' },
        { status: 403 }
      )
    }
    
    // Deletar comentário
    const { error } = await supabase
      .from('track_comments')
      .delete()
      .eq('id', commentId)
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}