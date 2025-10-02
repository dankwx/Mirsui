import React, { Suspense } from 'react'
import { getFeedPostsWithInteractions, checkUserLikedTrack } from '@/utils/socialInteractionsService'
import { createClient } from '@/utils/supabase/server'
import FeedContent from '@/components/FeedContent/FeedContent'
import { FeedSkeleton } from '@/components/ui/feed-skeleton'

export default async function FeedPage() {
    const supabase = createClient()
    
    // Buscar dados do usuário
    const { data: { user } } = await supabase.auth.getUser()
    
    // Buscar posts do feed
    const feedPosts = await getFeedPostsWithInteractions(20, 0)
    
    // Para cada post, verificar se o usuário logado curtiu
    const postsWithLikes = await Promise.all(
        feedPosts.map(async (post) => {
            let isLiked = false
            if (user) {
                isLiked = await checkUserLikedTrack(post.id, user.id)
            }
            return { ...post, isLiked }
        })
    )

    return (
        <Suspense fallback={<FeedSkeleton />}>
            <FeedContent initialPosts={postsWithLikes} />
        </Suspense>
    )
}