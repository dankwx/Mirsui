'use client'

import React, { useState, useTransition } from 'react'
import { ArrowDown, Pin, PinOff, Trash2 } from 'lucide-react'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import FotoDePerfil from '@/components/FotoDePerfil'
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
import { createClient } from '@/utils/supabase/client'
import { RECADO_SELECT, RECADOS_PAGE_SIZE, type Recado } from '@/utils/profileComments'
import { addRecado, deleteRecado, togglePinRecado } from './actions'
import styles from './Recados.module.css'

const MESES = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
]

interface RecadosProps {
    profileId: string
    currentUserId?: string | null
    initialComments: Recado[]
    total: number
}

function formatDate(iso: string) {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return ''
    return `${MESES[date.getMonth()]} ${date.getFullYear()}`
}

function displayNameOf(author: Recado['author']) {
    return author?.display_name || author?.username || 'Usuário'
}

function initialsOf(author: Recado['author']) {
    return displayNameOf(author).slice(0, 2).toUpperCase()
}

function sortRecados(list: Recado[]) {
    return [...list].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}

const Recados: React.FC<RecadosProps> = ({
    profileId,
    currentUserId,
    initialComments,
    total: initialTotal,
}) => {
    const [recados, setRecados] = useState<Recado[]>(() => sortRecados(initialComments))
    const [total, setTotal] = useState(initialTotal)
    const [content, setContent] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isPosting, startPosting] = useTransition()
    const [loadingMore, setLoadingMore] = useState(false)

    const isLoggedIn = !!currentUserId
    const isOwner = currentUserId === profileId
    const hasMore = recados.length < total

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        const trimmed = content.trim()
        if (!trimmed || isPosting) return
        setError(null)

        startPosting(async () => {
            const result = await addRecado(profileId, trimmed)
            if (!result.success) {
                setError(result.message)
                return
            }
            setRecados((prev) => sortRecados([result.data, ...prev]))
            setTotal((prev) => prev + 1)
            setContent('')
        })
    }

    const handleDelete = async (recado: Recado) => {
        const snapshot = recados
        setRecados((prev) => prev.filter((item) => item.id !== recado.id))
        setTotal((prev) => Math.max(0, prev - 1))

        const result = await deleteRecado(recado.id)
        if (!result.success) {
            setRecados(snapshot)
            setTotal((prev) => prev + 1)
            setError(result.message)
        }
    }

    const handleTogglePin = async (recado: Recado) => {
        const next = !recado.is_pinned
        setRecados((prev) =>
            sortRecados(
                prev.map((item) =>
                    item.id === recado.id ? { ...item, is_pinned: next } : item
                )
            )
        )

        const result = await togglePinRecado(recado.id, next)
        if (!result.success) {
            setRecados((prev) =>
                sortRecados(
                    prev.map((item) =>
                        item.id === recado.id ? { ...item, is_pinned: !next } : item
                    )
                )
            )
            setError(result.message)
        }
    }

    const loadMore = async () => {
        if (loadingMore) return
        setLoadingMore(true)
        try {
            const supabase = createClient()
            const { data, error: queryError } = await supabase
                .from('profile_comments')
                .select(RECADO_SELECT)
                .eq('profile_id', profileId)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false })
                .range(recados.length, recados.length + RECADOS_PAGE_SIZE - 1)

            if (queryError) throw queryError

            const next = (data ?? []) as unknown as Recado[]
            setRecados((prev) => {
                const existing = new Set(prev.map((item) => item.id))
                return sortRecados([
                    ...prev,
                    ...next.filter((item) => !existing.has(item.id)),
                ])
            })
        } catch (loadError) {
            console.error('Error loading more recados:', loadError)
            setError('Não foi possível carregar mais recados.')
        } finally {
            setLoadingMore(false)
        }
    }

    return (
        <section className={styles.section}>
            <div className={`${shellStyles.container} ${styles.container}`}>
                <div className={styles.heading}>
                    <h2>Recados</h2>
                    <p>
                        {total} {total === 1 ? 'recado' : 'recados'}
                    </p>
                </div>

                {isLoggedIn ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.composerAvatar}>vc</div>
                        <input
                            type="text"
                            value={content}
                            maxLength={500}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Deixe um recado…"
                        />
                        <button
                            type="submit"
                            disabled={!content.trim() || isPosting}
                            className={`${recipes.button} ${recipes.buttonSmall}`}
                        >
                            {isPosting ? 'Enviando...' : 'Enviar'}
                        </button>
                    </form>
                ) : (
                    <div className={styles.loginNotice}>
                        Entre para deixar um recado.{' '}
                        <AuthModalTrigger mode="login" className={recipes.textLink}>
                            Entrar ↗
                        </AuthModalTrigger>
                    </div>
                )}

                {error && (
                    <p className={styles.error} role="alert">
                        {error}
                    </p>
                )}

                {recados.length === 0 ? (
                    <p className={styles.empty}>Nenhum recado por aqui ainda.</p>
                ) : (
                    <ul className={styles.list}>
                        {recados.map((recado) => {
                            const canDelete =
                                currentUserId === recado.author?.id || isOwner
                            const name = displayNameOf(recado.author)
                            return (
                                <li
                                    key={recado.id}
                                    className={`${styles.item} ${recado.is_pinned ? styles.pinned : ''}`}
                                >
                                    <div className={styles.messageAvatar}>
                                        <FotoDePerfil
                                            src={recado.author?.avatar_url}
                                            className={styles.avatarImage}
                                        >
                                            <span>{initialsOf(recado.author)}</span>
                                        </FotoDePerfil>
                                    </div>
                                    <div className={styles.messageBody}>
                                        <div className={styles.meta}>
                                            <span className={styles.name}>{name}</span>
                                            {recado.author?.username && (
                                                <span className={styles.handle}>
                                                    @{recado.author.username}
                                                </span>
                                            )}
                                            {recado.is_pinned && (
                                                <span className={styles.pinLabel}>
                                                    <Pin size={11} aria-hidden="true" />
                                                    Fixado
                                                </span>
                                            )}
                                            <span className={styles.date}>
                                                {formatDate(recado.created_at)}
                                            </span>
                                        </div>
                                        <p className={styles.content}>{recado.content}</p>
                                    </div>

                                    {(isOwner || canDelete) && (
                                        <div className={styles.itemActions}>
                                            {isOwner && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleTogglePin(recado)}
                                                    title={recado.is_pinned ? 'Desafixar' : 'Fixar'}
                                                    aria-label={recado.is_pinned ? 'Desafixar' : 'Fixar'}
                                                >
                                                    {recado.is_pinned ? (
                                                        <PinOff size={13} aria-hidden="true" />
                                                    ) : (
                                                        <Pin size={13} aria-hidden="true" />
                                                    )}
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(recado)}
                                                    title="Remover recado"
                                                    aria-label="Remover recado"
                                                >
                                                    <Trash2 size={13} aria-hidden="true" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}

                {hasMore && (
                    <div className={styles.more}>
                        <button
                            type="button"
                            onClick={loadMore}
                            disabled={loadingMore}
                            className={recipes.textLink}
                            aria-busy={loadingMore}
                        >
                            {loadingMore ? 'Carregando…' : 'Ver mais recados'}
                            {!loadingMore && <ArrowDown size={15} aria-hidden="true" />}
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Recados
