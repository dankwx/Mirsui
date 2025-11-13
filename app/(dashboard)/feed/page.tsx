import React, { Suspense } from 'react'
import { getFeedPostsWithInteractions, checkUserLikedTracks, getRecentClaims } from '@/utils/feedService.backend'
import FeedContent from '@/components/FeedContent/FeedContent'
import { FeedSkeleton } from '@/components/ui/feed-skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Feed - Mirsui',
    description: 'Veja as últimas descobertas musicais da comunidade Mirsui.',
}

// Componente separado para buscar dados - permite melhor controle do Suspense
async function FeedData() {
    // Buscar posts do feed e reivindicações recentes em paralelo via backend
    // Carregar apenas 5 posts inicialmente para melhor performance
    const [feedPosts, recentClaims] = await Promise.all([
        getFeedPostsWithInteractions(5, 0),
        getRecentClaims(4) // Buscar apenas 4 músicas únicas
    ])
    
    if (feedPosts.length === 0) {
        return <FeedContent initialPosts={[]} recentClaims={recentClaims} />
    }
    
    // Buscar likes do usuário (se estiver logado) via backend
    const userLikes = await checkUserLikedTracks(
        feedPosts.map(post => post.id)
    )
    
    // Mapear posts com informação de like
    const postsWithLikes = feedPosts.map(post => ({
        ...post,
        isLiked: userLikes.has(post.id)
    }))

    return <FeedContent initialPosts={postsWithLikes} recentClaims={recentClaims} />
}

export default function FeedPage() {
    return (
        <Suspense fallback={<FeedSkeleton />}>
            <FeedData />
        </Suspense>
    )
}