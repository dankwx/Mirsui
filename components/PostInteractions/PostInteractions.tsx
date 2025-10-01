'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from '@/utils/supabase/client'

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
  const [user, setUser] = useState<any>(null)

  // Verificar usuário logado
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const handleLike = async () => {
    if (!user) return

    try {
      if (isLiked) {
        // Descurtir
        const response = await fetch(`/api/tracks/${trackId}/like`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setIsLiked(false)
          setLikesCount(prev => prev - 1)
        }
      } else {
        // Curtir
        const response = await fetch(`/api/tracks/${trackId}/like`, {
          method: 'POST',
        })
        
        if (response.ok) {
          setIsLiked(true)
          setLikesCount(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Erro ao processar like:', error)
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
    if (!user || !newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/tracks/${trackId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment_text: newComment.trim() }),
      })

      if (response.ok) {
        const newCommentData = await response.json()
        setComments(prev => [newCommentData, ...prev])
        setCommentsCount(prev => prev + 1)
        setNewComment('')
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error)
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
          disabled={!user}
          className={`flex items-center gap-2 ${
            isLiked ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={loadComments}
          disabled={isLoadingComments}
          className="flex items-center gap-2 text-gray-500"
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
            <Card className="p-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Escreva um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 min-h-[80px]"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Lista de comentários */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.avatar_url || undefined} />
                    <AvatarFallback>
                      {(comment.display_name || comment.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.display_name || comment.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      {user?.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm mt-1 text-gray-700">
                      {comment.comment_text}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            
            {comments.length === 0 && !isLoadingComments && (
              <p className="text-center text-gray-500 py-4">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}