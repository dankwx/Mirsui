'use client'

import { useState } from 'react'
import { Loader2, Share2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { capture } from '@/lib/posthog'

interface TrackShareProps {
    trackUri: string
    trackTitle: string
    artistName: string
    albumImageUrl: string
    year: number | null
    totalClaims: number
}

export default function TrackShare({
    trackUri,
    trackTitle,
    artistName,
    albumImageUrl,
    year,
    totalClaims,
}: TrackShareProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleGenerate = async () => {
        if (loading) return
        setLoading(true)
        try {
            const params = new URLSearchParams({
                title: trackTitle,
                artist: artistName,
                cover: albumImageUrl || '',
                total: String(totalClaims),
                year: String(year ?? ''),
            })
            const res = await fetch(`/api/og/selo?${params.toString()}`)
            if (!res.ok) throw new Error('falha ao gerar')

            const blob = await res.blob()
            const file = new File([blob], 'mirsui.png', { type: 'image/png' })
            capture('track_shared', {
                track_uri: trackUri,
            })

            // Mobile: abre a folha de compartilhamento (Instagram, etc).
            // Desktop / sem suporte: baixa o PNG.
            if (
                typeof navigator !== 'undefined' &&
                navigator.canShare?.({ files: [file] })
            ) {
                try {
                    await navigator.share({
                        files: [file],
                        title: `${trackTitle} — ${artistName}`,
                        text: 'Salvei essa faixa antes de virar mainstream.',
                    })
                } catch {
                    /* usuário cancelou */
                }
            } else {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'mirsui.png'
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
                toast({
                    title: 'Imagem baixada!',
                    description: 'Pronta pra postar no seu story.',
                })
            }
        } catch {
            toast({
                title: 'Erro ao gerar a imagem',
                description: 'Tente novamente em instantes.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="overflow-hidden rounded-xl border border-mir-line bg-mir-surface p-4">
            <div className="flex items-center gap-3">
                <span className="h-12 w-12 flex-none overflow-hidden rounded-md border border-mir-line bg-mir-fill2">
                    {albumImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={albumImageUrl}
                            alt={trackTitle}
                            className="h-full w-full object-cover"
                        />
                    ) : null}
                </span>
                <div className="min-w-0">
                    <div className="truncate text-[14px] font-bold tracking-[-0.01em] text-mir-text">
                        {trackTitle}
                    </div>
                    <div className="truncate text-[12px] text-mir-text2">
                        {artistName}
                    </div>
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-mir-acc py-3 text-[13.5px] font-bold text-mir-on-acc transition hover:brightness-110 disabled:opacity-70"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Share2 className="h-4 w-4" />
                )}
                Compartilhar no story
            </button>
            <p className="mt-2 text-center text-[11px] text-mir-text3">
                gera uma imagem pronta pro Instagram
            </p>
        </section>
    )
}
