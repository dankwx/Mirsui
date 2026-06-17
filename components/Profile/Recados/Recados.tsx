'use client'

import React, { useState, useTransition } from 'react'
import { Pin, PinOff, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { addRecado, deleteRecado, togglePinRecado } from './actions'
import { RECADO_SELECT, RECADOS_PAGE_SIZE, type Recado } from '@/utils/profileComments'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

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
    return author?.display_name || author?.username || 'usuário'
}

function initialsOf(author: Recado['author']) {
    return displayNameOf(author).slice(0, 2).toUpperCase()
}

// tom estável a partir do nome (fallback de avatar)
const TONES = ['#241f1a', '#1c2320', '#27201f', '#1b2026', '#231d27', '#202420', '#2a201b', '#1a2326', '#25211c', '#1d2126', '#26211f', '#1f231d']
function tone(seed: string) {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
    return TONES[h % TONES.length]
}

// Fixados primeiro, depois mais recentes — espelha a ordenação do servidor.
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
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
        setRecados((prev) => prev.filter((r) => r.id !== recado.id))
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
            sortRecados(prev.map((r) => (r.id === recado.id ? { ...r, is_pinned: next } : r)))
        )

        const result = await togglePinRecado(recado.id, next)
        if (!result.success) {
            setRecados((prev) =>
                sortRecados(prev.map((r) => (r.id === recado.id ? { ...r, is_pinned: !next } : r)))
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
                const existing = new Set(prev.map((r) => r.id))
                return sortRecados([...prev, ...next.filter((r) => !existing.has(r.id))])
            })
        } catch (err) {
            console.error('Error loading more recados:', err)
            setError('Não foi possível carregar mais recados.')
        } finally {
            setLoadingMore(false)
        }
    }

    return (
        <section className="pb-16 pt-9">
            {/* Cabeçalho da seção */}
            <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-[18px]">
                <div className="flex items-baseline gap-[11px]">
                    <h3 className="whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.13em] text-mir-text2">
                        Recados
                    </h3>
                    <span className="font-mono text-[11px] text-mir-text3">
                        {total} {total === 1 ? 'recado' : 'recados'}
                    </span>
                </div>
            </div>

            {/* Caixa de novo recado */}
            {isLoggedIn ? (
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-3 rounded-[12px] border border-mir-line bg-mir-fill1 p-2.5 transition focus-within:border-mir-line2"
                >
                    <div className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[9px] border border-mir-line bg-mir-fill2 font-mono text-[11px] font-semibold uppercase text-mir-text3">
                        vc
                    </div>
                    <input
                        type="text"
                        value={content}
                        maxLength={500}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="deixe um recado..."
                        className="min-w-0 flex-1 bg-transparent px-1 text-[14px] text-mir-text placeholder:text-mir-text3 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!content.trim() || isPosting}
                        className="flex-none rounded-[9px] bg-mir-acc px-[18px] py-[9px] text-[13px] font-semibold text-mir-on-acc transition hover:brightness-105 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPosting ? 'Enviando...' : 'Enviar'}
                    </button>
                </form>
            ) : (
                <div className="rounded-[12px] border border-mir-line bg-mir-fill1 px-4 py-3.5 font-mono text-[12.5px] text-mir-text3">
                    faça login para deixar um recado
                </div>
            )}

            {error && (
                <p className="mt-2 font-mono text-[11.5px] text-red-400">{error}</p>
            )}

            {/* Lista */}
            {recados.length === 0 ? (
                <div className="mt-5 rounded-[12px] border border-dashed border-mir-line2 px-8 py-12 text-center font-mono text-[13px] text-mir-text3">
                    nenhum recado por aqui ainda
                </div>
            ) : (
                <ul className="mt-2">
                    {recados.map((recado) => {
                        const canDelete = currentUserId === recado.author?.id || isOwner
                        const name = displayNameOf(recado.author)
                        return (
                            <li
                                key={recado.id}
                                className={`group relative flex gap-[14px] border-b border-mir-line py-[18px] ${
                                    recado.is_pinned
                                        ? 'border-l-2 border-l-mir-acc bg-mir-acc-soft pl-[14px] pr-3'
                                        : ''
                                }`}
                            >
                                {/* Avatar */}
                                {recado.author?.avatar_url ? (
                                    <img
                                        src={recado.author.avatar_url}
                                        alt={name}
                                        className="h-[38px] w-[38px] flex-none rounded-[9px] border border-mir-line object-cover"
                                    />
                                ) : (
                                    <div
                                        className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[9px] border border-mir-line font-mono text-[11px] font-bold uppercase text-mir-text2"
                                        style={{ backgroundColor: tone(name) }}
                                    >
                                        {initialsOf(recado.author)}
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[14px] font-bold tracking-tight text-mir-text">
                                            {name}
                                        </span>
                                        {recado.author?.username && (
                                            <span className="font-mono text-[12px] text-mir-text3">
                                                @{recado.author.username}
                                            </span>
                                        )}
                                        {recado.is_pinned && (
                                            <span className="inline-flex items-center gap-1 rounded-[5px] bg-mir-acc px-[6px] py-[2px] font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-mir-on-acc">
                                                Fixado
                                            </span>
                                        )}
                                        <span className="ml-auto whitespace-nowrap pl-3 font-mono text-[11px] text-mir-text3">
                                            {formatDate(recado.created_at)}
                                        </span>
                                    </div>
                                    <p className="mt-[7px] break-words text-[14px] leading-normal text-mir-text2">
                                        {recado.content}
                                    </p>
                                </div>

                                {/* Ações (aparecem no hover) */}
                                {(isOwner || canDelete) && (
                                    <div className="absolute right-2 top-[14px] flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                                        {isOwner && (
                                            <button
                                                type="button"
                                                onClick={() => handleTogglePin(recado)}
                                                title={recado.is_pinned ? 'Desafixar' : 'Fixar'}
                                                className="grid h-[26px] w-[26px] place-items-center rounded-[7px] border border-mir-line bg-mir-surface text-mir-text3 transition hover:border-mir-line2 hover:text-mir-text"
                                            >
                                                {recado.is_pinned ? (
                                                    <PinOff className="h-[13px] w-[13px]" />
                                                ) : (
                                                    <Pin className="h-[13px] w-[13px]" />
                                                )}
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(recado)}
                                                title="Remover recado"
                                                className="grid h-[26px] w-[26px] place-items-center rounded-[7px] border border-mir-line bg-mir-surface text-mir-text3 transition hover:border-red-400/40 hover:text-red-400"
                                            >
                                                <Trash2 className="h-[13px] w-[13px]" />
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
                <div className="mt-6 flex justify-center">
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="rounded-full border border-mir-line bg-mir-fill1 px-5 py-2 text-[12.5px] font-semibold text-mir-text2 transition hover:border-mir-line2 hover:text-mir-text disabled:opacity-50"
                    >
                        {loadingMore ? 'Carregando...' : 'Ver mais recados'}
                    </button>
                </div>
            )}
        </section>
    )
}

export default Recados
