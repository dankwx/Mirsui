'use client'

// O feed: as abas, o destaque, as linhas e o "carregar mais".
//
// O estado de salvar mora aqui, e não em cada linha, porque salvar é por
// MÚSICA (track_uri) e não por achado (id da linha). A mesma faixa pode
// aparecer duas vezes no feed, salva por pessoas diferentes; salvar numa tem
// que marcar a outra na hora, senão a tela se contradiz.
//
// `savedNow` guarda só o que foi salvo nesta sessão — o que já estava salvo
// vem em `saved_by_me` de cada post. Assim não há estado inicial para
// sincronizar quando chegam posts novos do "carregar mais".

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RotateCw } from 'lucide-react'
import recipes from '@/components/Club/club-recipes.module.css'
import { createClient } from '@/utils/supabase/client'
import { saveTrack } from '@/utils/trackActions'
import type { FeedPost } from './format'
import FeedHighlight from './FeedHighlight'
import FeedItem from './FeedItem'
import { EmptyState, ErrorState } from './FeedStates'
import type { SaveState } from './SaveButton'
import styles from './Feed.module.css'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
const PAGE_SIZE = 5

type Tab = 'cena' | 'seguindo'

const TABS: { id: Tab; label: string }[] = [
    { id: 'cena', label: 'A cena' },
    { id: 'seguindo', label: 'De quem você segue' },
]

interface FeedProps {
    initialPosts: FeedPost[]
    currentUserId: string | null
    /** a busca no servidor falhou — diferente de "não veio nada" */
    loadFailed?: boolean
}

export default function Feed({
    initialPosts,
    currentUserId,
    loadFailed = false,
}: FeedProps) {
    const router = useRouter()
    const [retrying, startRetry] = useTransition()
    const retry = () => startRetry(() => router.refresh())

    const [posts, setPosts] = useState(initialPosts)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(initialPosts.length === PAGE_SIZE)
    const [loadMoreFailed, setLoadMoreFailed] = useState(false)
    const [tab, setTab] = useState<Tab>('cena')

    const isAuthenticated = !!currentUserId

    /* ---------- salvar ---------- */
    const [savedNow, setSavedNow] = useState<Set<string>>(() => new Set())
    const [savingUri, setSavingUri] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<{ uri: string; message: string } | null>(null)

    const save = async (post: FeedPost) => {
        const uri = post.track_uri
        if (!uri || !isAuthenticated || savingUri || post.saved_by_me || savedNow.has(uri)) return

        setSavingUri(uri)
        setSaveError(null)
        // otimista: o botão vira selo antes da ida ao servidor
        setSavedNow((current) => new Set(current).add(uri))

        const result = await saveTrack({
            trackUri: uri,
            trackName: post.track_title,
            artistName: post.artist_name,
            albumName: post.album_name,
            spotifyUrl: post.track_url,
            trackThumbnail: post.track_thumbnail || '',
            popularity: post.popularity,
        })

        if (!result.success) {
            setSavedNow((current) => {
                const next = new Set(current)
                next.delete(uri)
                return next
            })
            setSaveError({ uri, message: result.message })
        }
        setSavingUri(null)
    }

    const saveStateOf = (post: FeedPost): SaveState => {
        const uri = post.track_uri
        const savedInSession = !!uri && savedNow.has(uri)
        return {
            saved: post.saved_by_me || savedInSession,
            // o contador do servidor não conhece o que acabei de salvar agora
            savers: post.savers_count + (savedInSession && !post.saved_by_me ? 1 : 0),
            busy: !!uri && savingUri === uri,
            error: saveError?.uri === uri ? saveError.message : null,
            canSave: isAuthenticated && !!uri,
            onSave: () => save(post),
        }
    }

    /* ---------- carregar mais ---------- */
    const loadMore = async () => {
        setLoading(true)
        setLoadMoreFailed(false)
        try {
            // O token vai junto porque é ele que faz o backend devolver
            // `saved_by_me`. Sem isso, as faixas carregadas aqui voltariam a
            // oferecer "Salvar" para quem já salvou.
            const headers: HeadersInit = { 'Content-Type': 'application/json' }
            try {
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.access_token) {
                    headers['Authorization'] = `Bearer ${session.access_token}`
                }
            } catch (error) {
                console.error('Erro ao obter sessão:', error)
            }

            const response = await fetch(
                `${BACKEND_URL}/feed?limit=${PAGE_SIZE}&offset=${posts.length}`,
                { headers }
            )
            if (!response.ok) {
                console.error('Erro ao carregar mais achados:', response.status)
                setLoadMoreFailed(true)
                return
            }
            const data = await response.json()
            const newPosts: FeedPost[] = data.posts || []
            if (newPosts.length === 0) {
                setHasMore(false)
                return
            }

            // append puro: a lista só cresce para baixo, então o scroll do
            // usuário não se move e não há posição para restaurar
            setPosts((current) => [...current, ...newPosts])
            if (newPosts.length < PAGE_SIZE) setHasMore(false)
        } catch (error) {
            console.error('Erro ao carregar mais achados:', error)
            setLoadMoreFailed(true)
        } finally {
            setLoading(false)
        }
    }

    // Sem dados de "quem você segue" nesta carga; a aba fica preparada
    // para quando essa relação for fornecida pelo backend.
    const onCena = tab === 'cena'
    const highlight = onCena ? posts[0] : undefined
    const rest = useMemo(() => (onCena ? posts.slice(1) : []), [onCena, posts])
    const hasAny = posts.length > 0

    return (
        <section className={styles.feed} aria-label="Achados da cena">
            <div
                className={`${recipes.filters} ${styles.filters}`}
                role="group"
                aria-label="Filtrar achados"
            >
                {TABS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        aria-pressed={tab === item.id}
                        className={tab === item.id ? recipes.filterActive : recipes.filter}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {highlight && (
                <FeedHighlight
                    post={highlight}
                    isOwn={highlight.user_id === currentUserId}
                    save={saveStateOf(highlight)}
                />
            )}

            {loadFailed && posts.length === 0 ? (
                <ErrorState onRetry={retry} retrying={retrying} />
            ) : rest.length > 0 ? (
                <>
                    <div className={styles.list}>
                        {rest.map((post) => (
                            <FeedItem
                                key={post.id}
                                post={post}
                                isOwn={post.user_id === currentUserId}
                                save={saveStateOf(post)}
                            />
                        ))}
                    </div>

                    {hasMore && (
                        <div className={styles.more}>
                            <button
                                type="button"
                                onClick={loadMore}
                                disabled={loading}
                                className={recipes.outlineButton}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={15} className={styles.spin} aria-hidden="true" />
                                        Carregando…
                                    </>
                                ) : loadMoreFailed ? (
                                    <>
                                        <RotateCw size={15} aria-hidden="true" />
                                        Tentar de novo
                                    </>
                                ) : (
                                    'Carregar mais achados'
                                )}
                            </button>
                            {loadMoreFailed && !loading && (
                                <p className={styles.moreError} role="alert">
                                    Não deu para buscar agora.
                                </p>
                            )}
                        </div>
                    )}
                </>
            ) : !onCena ? (
                <EmptyState
                    title="Você ainda não segue ninguém"
                    body="Quando você seguir outros ouvintes, o que eles salvarem aparece aqui, separado do barulho da cena inteira."
                />
            ) : (
                <EmptyState
                    title={hasAny ? 'Por enquanto, só este achado' : 'A cena ainda está em silêncio'}
                    body={
                        hasAny
                            ? 'A cena está quieta agora. Volte mais tarde para os próximos achados.'
                            : 'Ninguém salvou nada ainda. Seja o primeiro e seu nome abre o histórico da faixa.'
                    }
                />
            )}
        </section>
    )
}
