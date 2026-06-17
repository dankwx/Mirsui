'use client'

import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Send, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface TrackActionsProps {
    trackUri: string
    trackTitle: string
    artistName: string
    albumName: string
    popularity: number
    trackThumbnail: string
    trackUrl: string
    totalClaims: number
    initialClaimed?: boolean
    userPosition?: number | null
}

export default function TrackActions({
    trackUri,
    trackTitle,
    artistName,
    albumName,
    popularity,
    trackThumbnail,
    trackUrl,
    totalClaims,
    initialClaimed = false,
    userPosition = null,
}: TrackActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isClaimed, setIsClaimed] = useState(initialClaimed)
    const [position, setPosition] = useState(userPosition)
    const [total, setTotal] = useState(totalClaims)
    const [showMessage, setShowMessage] = useState(false)
    const [message, setMessage] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { toast } = useToast()

    useEffect(() => {
        if (showMessage && textareaRef.current) textareaRef.current.focus()
    }, [showMessage])

    const handleClaim = async () => {
        if (isClaimed || isLoading) return
        setIsLoading(true)
        try {
            const spotifyUrl =
                trackUrl ||
                `https://open.spotify.com/track/${trackUri.split(':')[2]}`

            const response = await fetch('/api/claim-track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackUri,
                    trackName: trackTitle,
                    artistName,
                    albumName,
                    spotifyUrl,
                    trackThumbnail,
                    popularity,
                    claimMessage: message.trim() || undefined,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 401) {
                    toast({
                        title: 'Faça login para reivindicar',
                        description:
                            data.error ||
                            'Você precisa estar logado para reivindicar uma faixa.',
                        variant: 'destructive',
                    })
                    return
                }
                if (response.status === 409) {
                    setIsClaimed(true)
                    setPosition(data.position)
                    toast({
                        title: 'Você já reivindicou esta faixa',
                        description: `Sua posição é #${data.position}.`,
                        variant: 'destructive',
                    })
                    return
                }
                throw new Error(data.error || 'Erro ao reivindicar faixa')
            }

            setIsClaimed(true)
            setPosition(data.position)
            setTotal((t) => t + 1)
            setShowMessage(false)
            setMessage('')
            toast({
                title: 'Faixa reivindicada!',
                description: `Você é o #${data.position} a cravar "${trackTitle}".`,
            })
        } catch (error) {
            toast({
                title: 'Erro ao reivindicar',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Ocorreu um erro inesperado. Tente novamente.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleShare = async () => {
        const shareData = {
            title: `${trackTitle} — ${artistName}`,
            text: 'Confira esta faixa no Mirsui',
            url: trackUrl,
        }
        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(trackUrl)
                toast({
                    title: 'Link copiado!',
                    description: 'O link da faixa foi copiado.',
                })
            }
        } catch {
            /* usuário cancelou o compartilhamento */
        }
    }

    return (
        <div>
            <div className="mt-[26px] flex items-center gap-[9px]">
                <button
                    onClick={handleClaim}
                    disabled={isLoading || isClaimed}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-[11px] py-[11px] pl-5 pr-[22px] text-[14px] font-semibold transition active:translate-y-px disabled:cursor-default ${
                        isClaimed
                            ? 'border border-mir-line2 bg-transparent text-mir-text2'
                            : 'bg-mir-acc text-mir-on-acc hover:brightness-[1.07] disabled:opacity-70'
                    }`}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Heart
                            className="h-4 w-4"
                            fill={isClaimed ? 'none' : 'currentColor'}
                        />
                    )}
                    {isClaimed
                        ? `Reivindicada${position ? ` · #${position}` : ''}`
                        : 'Reivindicar'}
                </button>

                <button
                    onClick={() => setShowMessage((s) => !s)}
                    disabled={isClaimed}
                    aria-label="Comentar ao reivindicar"
                    className="inline-flex items-center justify-center rounded-[11px] border border-mir-line2 p-[11px] text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text disabled:opacity-50"
                >
                    <MessageCircle className="h-4 w-4" />
                </button>

                <button
                    onClick={handleShare}
                    aria-label="Compartilhar"
                    className="inline-flex items-center justify-center rounded-[11px] border border-mir-line2 p-[11px] text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text"
                >
                    <Share2 className="h-4 w-4" />
                </button>
            </div>

            {showMessage && !isClaimed && (
                <div className="mt-3 rounded-xl border border-mir-line bg-mir-surface p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-[12.5px] font-semibold text-mir-text">
                            Deixe uma nota ao cravar (opcional)
                        </span>
                        <button
                            onClick={() => setShowMessage(false)}
                            aria-label="Fechar"
                            className="text-mir-text3 transition hover:text-mir-text"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={280}
                        placeholder="Por que essa faixa importa pra você…"
                        className="min-h-[72px] w-full resize-none rounded-lg border border-mir-line bg-mir-bg px-3 py-2 text-[13px] text-mir-text outline-none transition placeholder:text-mir-text3 focus:border-mir-line2"
                    />
                    <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-[10.5px] text-mir-text3">
                            {message.length}/280
                        </span>
                        <button
                            onClick={handleClaim}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-lg bg-mir-acc px-4 py-2 text-[12.5px] font-semibold text-mir-on-acc transition hover:brightness-[1.07] disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                            Reivindicar
                        </button>
                    </div>
                </div>
            )}

            <p className="mt-[22px] flex flex-wrap items-center gap-2 text-[13.5px] text-mir-text2">
                <span className="inline-block h-1.5 w-1.5 flex-none rounded-full bg-mir-acc shadow-[0_0_0_3px_rgba(132,184,106,0.14)]" />
                {isClaimed ? (
                    <>
                        Você é o{' '}
                        <b className="font-bold text-mir-text">
                            {position ? `${position}º` : `${total}º`}
                        </b>{' '}
                        a reivindicar
                        <span className="font-mono text-mir-text3">·</span>
                        entrou pra história dessa faixa
                    </>
                ) : (
                    <>
                        <b className="font-bold text-mir-text">{total}</b>
                        {total === 1 ? ' já reivindicou' : ' já reivindicaram'}
                        <span className="font-mono text-mir-text3">·</span>
                        seja o{' '}
                        <b className="font-bold text-mir-text">{total + 1}º</b>{' '}
                        antes de virar mainstream
                    </>
                )}
            </p>
        </div>
    )
}
