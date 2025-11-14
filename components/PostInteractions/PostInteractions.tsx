'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '@/components/AuthProvider/AuthProvider'

interface TrackComment {
  id: number
  track_id: number
  user_id: string
  comment_text: string
  created_at: string
  updated_at: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

interface PostInteractionsProps {
  trackId: number
  initialLikesCount: number
  initialCommentsCount: number
  initialIsLiked?: boolean
}

export default function PostInteractions({
  trackId,
  initialLikesCount,
  initialCommentsCount,
  initialIsLiked = false
}: PostInteractionsProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<TrackComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  // Usar o Context ao invés de fazer requisição
  const { user, isLoading: isLoadingUser, isAuthenticated } = useAuth()

  const handleLike = async () => {
    if (!isAuthenticated) {
      console.log('❌ Usuário não está logado')
      return
    }

    console.log('👆 Processando like...', { trackId, isLiked })

    try {
      if (isLiked) {
        // Descurtir
        console.log('📤 Removendo like...')
        const response = await fetch(`/api/tracks/${trackId}/like`, {
          method: 'DELETE',
        })
        
        console.log('📥 Resposta DELETE:', response.status)
        
        if (response.ok) {
          setIsLiked(false)
          setLikesCount(prev => prev - 1)
          console.log('✅ Like removido com sucesso')
        } else {
          const error = await response.json()
          console.error('❌ Erro ao remover like:', error)
        }
      } else {
        // Curtir
        console.log('📤 Adicionando like...')
        const response = await fetch(`/api/tracks/${trackId}/like`, {
          method: 'POST',
        })
        
        console.log('📥 Resposta POST:', response.status)
        
        if (response.ok) {
          setIsLiked(true)
          setLikesCount(prev => prev + 1)
          console.log('✅ Like adicionado com sucesso')
        } else {
          const error = await response.json()
          console.error('❌ Erro ao adicionar like:', error)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao processar like:', error)
    }
  }

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments)
      return
    }

    setIsLoadingComments(true)
    try {
      const url = `/api/tracks/${trackId}/comments?limit=10&offset=0`
      console.log('Fazendo request para:', url)
      
      const response = await fetch(url)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Comentários recebidos:', data)
        setComments(data)
        setShowComments(true)
      } else {
        const errorText = await response.text()
        console.error('Erro na resposta:', response.status, errorText)
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!user) {
      console.log('❌ Usuário não está logado')
      return
    }
    
    if (!newComment.trim()) {
      console.log('❌ Comentário vazio')
      return
    }

    console.log('💬 Enviando comentário...', { trackId, comment: newComment.trim() })

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/tracks/${trackId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment_text: newComment.trim() }),
      })

      console.log('📥 Resposta POST comentário:', response.status)

      if (response.ok) {
        const newCommentData = await response.json()
        console.log('✅ Comentário criado:', newCommentData)
        setComments(prev => [newCommentData, ...prev])
        setCommentsCount(prev => prev + 1)
        setNewComment('')
      } else {
        const error = await response.json()
        console.error('❌ Erro ao criar comentário:', error)
      }
    } catch (error) {
      console.error('❌ Erro ao enviar comentário:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId))
        setCommentsCount(prev => prev - 1)
      }
    } catch (error) {
      console.error('Erro ao deletar comentário:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Botões de interação */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLoadingUser || !user}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium uppercase tracking-[0.2em] hover:bg-transparent ${
            isLiked
              ? 'text-pink-300 hover:text-pink-200'
              : 'text-white/60 hover:text-white'
          }`}
          title={!user ? 'Faça login para curtir' : ''}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={loadComments}
          disabled={isLoadingComments}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium uppercase tracking-[0.2em] text-white/60 hover:bg-transparent hover:text-white"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{commentsCount}</span>
        </Button>
      </div>

      {/* Seção de comentários */}
      {showComments && (
        <div className="space-y-4">
          {/* Formulário para novo comentário */}
          {user && (
            <Card className="border border-white/10 bg-white/[0.02] p-4 text-white">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Escreva um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 min-h-[80px] border border-white/10 bg-white/[0.02] text-white placeholder:text-white/40 focus-visible:ring-white/40"
                />
                <Button
                  variant="ghost"
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  size="sm"
                  className="rounded-full border border-white/20 bg-white/[0.08] text-white hover:bg-white/20"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Lista de comentários */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className="border border-white/10 bg-white/[0.02] p-4 text-white">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-white/10 bg-white/10">
                    <AvatarImage src={comment.avatar_url || undefined} />
                    <AvatarFallback className="bg-purple-600/30 text-purple-100">
                      {(comment.display_name || comment.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {comment.display_name || comment.username}
                        </span>
                        <span className="text-xs text-white/45">
                          {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      {user?.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-300 hover:bg-transparent hover:text-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="mt-1 text-sm text-white/80">
                      {comment.comment_text}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            
            {comments.length === 0 && !isLoadingComments && (
              <p className="py-4 text-center text-white/45">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}