import React from 'react'
import { getFeedPostsWithInteractions, checkUserLikedTracks, getRecentClaims } from '@/utils/feedService.backend'
import FeedContent from '@/components/FeedContent/FeedContent'
import LandingFooter from '@/components/Footer/LandingFooter'
import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Feed - Mirsui',
    description: 'Veja as últimas descobertas musicais da comunidade Mirsui.',
}

// Depende da sessão (cookies) → sempre renderiza no servidor com dados frescos.
// Renderização bloqueante (sem Suspense): o Next mantém a página anterior na
// tela até a feed estar pronta e troca de uma vez, evitando o flash do skeleton.
export const dynamic = 'force-dynamic'

export default async function FeedPage() {
    const supabase = await createClient()

    // Carregar apenas 5 posts inicialmente para melhor performance.
    // Primeiro descobre quem está logado e quais posts existem em paralelo.
    const [{ data: { user } }, feedPosts, recentClaims] = await Promise.all([
        supabase.auth.getUser(),
        getFeedPostsWithInteractions(5, 0),
        getRecentClaims(4) // Buscar apenas 4 músicas únicas
    ])

    const currentUserId = user?.id ?? null

    // Buscar likes do usuário (se estiver logado) só quando há posts.
    const userLikes = feedPosts.length > 0
        ? await checkUserLikedTracks(feedPosts.map(post => post.id))
        : new Set<number>()

    // Mapear posts com informação de like
    const postsWithLikes = feedPosts.map(post => ({
        ...post,
        isLiked: userLikes.has(post.id)
    }))

    return (
        <>
            <FeedContent initialPosts={postsWithLikes} recentClaims={recentClaims} currentUserId={currentUserId} />
            <LandingFooter />
        </>
    )
}