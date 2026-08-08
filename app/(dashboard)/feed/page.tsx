import React from 'react'
import { getFeedPostsWithInteractions, getRecentClaims } from '@/utils/feedService.backend'
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
    const [{ data: { user } }, feed, recent] = await Promise.all([
        supabase.auth.getUser(),
        getFeedPostsWithInteractions(5, 0),
        getRecentClaims(4) // Buscar apenas 4 músicas únicas
    ])

    const currentUserId = user?.id ?? null

    // `saved_by_me` já vem de /feed: o backend resolve na mesma requisição,
    // usando o token que authHeaders() manda. Não há segunda ida ao banco.

    return (
        // min-h + flex column: com a aba "seguindo" vazia a página fica curta e o
        // rodapé flutuava no meio da tela. Escopado aqui para não mexer no
        // fluxo das outras páginas do dashboard.
        <div className="flex min-h-[calc(100dvh-72px)] flex-col">
            <div className="flex-1">
                <FeedContent
                    initialPosts={feed.posts}
                    recentClaims={recent.claims}
                    currentUserId={currentUserId}
                    loadFailed={feed.failed}
                    recentClaimsFailed={recent.failed}
                />
            </div>
            <LandingFooter compact />
        </div>
    )
}