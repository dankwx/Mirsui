import React, { Suspense } from 'react'
import { getFeedPostsWithInteractions, checkUserLikedTracks } from '@/utils/socialInteractionsService'
import { createClient } from '@/utils/supabase/server'
import FeedContent from '@/components/FeedContent/FeedContent'
import { FeedSkeleton } from '@/components/ui/feed-skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Feed - SoundSage',
    description: 'Veja as últimas descobertas musicais da comunidade SoundSage.',
}

// Componente separado para buscar dados - permite melhor controle do Suspense
async function FeedData() {
    const supabase = createClient()
    
    // Buscar posts do feed primeiro (rápido)
    const feedPosts = await getFeedPostsWithInteractions(20, 0)
    
    if (feedPosts.length === 0) {
        return <FeedContent initialPosts={[]} />
    }
    
    // Só buscar dados do usuário se houver posts
    const { data: { user } } = await supabase.auth.getUser()
    
    // Se há usuário logado, buscar todos os likes de uma vez (mais eficiente)
    let userLikes: Set<number> = new Set()
    if (user) {
        userLikes = await checkUserLikedTracks(
            feedPosts.map(post => post.id), 
            user.id
        )
    }
    
    // Mapear posts com informação de like
    const postsWithLikes = feedPosts.map(post => ({
        ...post,
        isLiked: userLikes.has(post.id)
    }))

    return <FeedContent initialPosts={postsWithLikes} />
}

export default function FeedPage() {
    return (
        <Suspense fallback={<FeedSkeleton />}>
            <FeedData />
        </Suspense>
    )
}