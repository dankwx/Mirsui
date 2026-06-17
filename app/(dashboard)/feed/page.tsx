import React, { Suspense } from 'react'
import { getFeedPostsWithInteractions, checkUserLikedTracks, getRecentClaims } from '@/utils/feedService.backend'
import FeedContent from '@/components/FeedContent/FeedContent'
import { FeedSkeleton } from '@/components/ui/feed-skeleton'
import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Feed - Mirsui',
    description: 'Veja as últimas descobertas musicais da comunidade Mirsui.',
}

// Componente separado para buscar dados - permite melhor controle do Suspense
async function FeedData() {
    const supabase = await createClient()

    // Buscar usuário logado, posts do feed e reivindicações recentes em paralelo
    // Carregar apenas 5 posts inicialmente para melhor performance
    const [{ data: { user } }, feedPosts, recentClaims] = await Promise.all([
        supabase.auth.getUser(),
        getFeedPostsWithInteractions(5, 0),
        getRecentClaims(4) // Buscar apenas 4 músicas únicas
    ])

    const currentUserId = user?.id ?? null

    if (feedPosts.length === 0) {
        return <FeedContent initialPosts={[]} recentClaims={recentClaims} currentUserId={currentUserId} />
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

    return <FeedContent initialPosts={postsWithLikes} recentClaims={recentClaims} currentUserId={currentUserId} />
}

export default function FeedPage() {
    return (
        <Suspense fallback={<FeedSkeleton />}>
            <FeedData />
        </Suspense>
    )
}