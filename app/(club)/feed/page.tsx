// app/(club)/feed/page.tsx
//
// A home de quem está logado: o que a cena andou salvando.
//
// Vive no grupo `(club)`, com o shell, o header e o rodapé compactos de
// DESIGN.md. A composição segue a linha "Feed" do guia: pessoas e achados com
// bom ritmo de leitura, espaçamento compacto. Os dados, a paginação, o salvar
// direto do feed e a porta da pilha não mudaram.

import { getFeedPostsWithInteractions, getRecentClaims } from '@/utils/feedService.backend'
import Feed from '@/components/Feed/Feed'
import PileInvite from '@/components/Feed/PileInvite'
import shellStyles from '@/components/Club/ClubShell.module.css'
import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'
import styles from './page.module.css'

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
        getRecentClaims(4), // Buscar apenas 4 músicas únicas
    ])

    const currentUserId = user?.id ?? null

    // `saved_by_me` já vem de /feed: o backend resolve na mesma requisição,
    // usando o token que authHeaders() manda. Não há segunda ida ao banco.

    return (
        <div className={`${shellStyles.container} ${styles.page}`}>
            <header className={styles.heading}>
                <h1>Achados</h1>
                <p>Quem ouviu primeiro o quê, na ordem em que aconteceu.</p>
            </header>

            <div className={styles.body}>
                <Feed
                    initialPosts={feed.posts}
                    currentUserId={currentUserId}
                    loadFailed={feed.failed}
                />
                <aside className={styles.rail}>
                    <PileInvite claims={recent.claims} loadFailed={recent.failed} />
                </aside>
            </div>
        </div>
    )
}
