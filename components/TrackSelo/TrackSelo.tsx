'use client'

import { useState } from 'react'
import { Download, Loader2, Lock, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { capture } from '@/lib/posthog'

interface TrackSeloProps {
    trackUri: string
    trackTitle: string
    artistName: string
    albumImageUrl: string
    claimed: boolean
    position: number | null
    year: number | null
    totalClaims: number
    isLoggedIn: boolean
}

export default function TrackSelo({
    trackUri,
    trackTitle,
    artistName,
    albumImageUrl,
    claimed,
    position,
    year,
    totalClaims,
    isLoggedIn,
}: TrackSeloProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const isFirst = position === 1
    const bigLabel = isFirst ? '1º HIPSTER' : position ? `#${position}` : '✦'
    const kicker = isFirst ? 'primeiro a cravar' : 'no acervo'

    const handleGenerate = async () => {
        if (loading) return
        setLoading(true)
        try {
            const params = new URLSearchParams({
                title: trackTitle,
                artist: artistName,
                cover: albumImageUrl || '',
                position: String(position ?? ''),
                total: String(totalClaims),
                year: String(year ?? ''),
            })
            const res = await fetch(`/api/og/selo?${params.toString()}`)
            if (!res.ok) throw new Error('falha ao gerar')

            const blob = await res.blob()
            const file = new File([blob], 'mirsui-selo.png', {
                type: 'image/png',
            })
            capture('selo_generated', {
                track_uri: trackUri,
                position: position ?? null,
            })

            // Em mobile, compartilha direto (abre Instagram/etc); senão baixa
            if (
                typeof navigator !== 'undefined' &&
                navigator.canShare?.({ files: [file] })
            ) {
                try {
                    await navigator.share({
                        files: [file],
                        title: `${trackTitle} — ${artistName}`,
                        text: 'Cravei essa faixa antes de virar mainstream 🌱',
                    })
                } catch {
                    /* usuário cancelou */
                }
            } else {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'mirsui-selo.png'
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
                toast({
                    title: 'Selo baixado!',
                    description: 'Pronto pra postar no seu story.',
                })
            }
        } catch {
            toast({
                title: 'Erro ao gerar o selo',
                description: 'Tente novamente em instantes.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="overflow-hidden rounded-xl bg-mir-acc px-[22px] py-5 text-mir-on-acc">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] opacity-70">
                <Sparkles className="h-3.5 w-3.5" /> Selo de descoberta
            </span>

            {/* Preview do selo */}
            <div
                className={`mt-3.5 rounded-[10px] border-2 px-4 py-4 text-center ${
                    claimed
                        ? 'border-mir-on-acc/30'
                        : 'border-dashed border-mir-on-acc/25'
                }`}
            >
                {claimed ? (
                    <>
                        <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] opacity-55">
                            {kicker}
                        </div>
                        <div className="mt-1 text-[30px] font-black leading-none tracking-[-0.03em]">
                            {bigLabel}
                        </div>
                        <div className="mt-2.5 truncate text-[13.5px] font-bold">
                            {trackTitle}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] opacity-55">
                            {artistName}
                            {year ? ` · cravado ${year}` : ''}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center py-2 opacity-65">
                        <Lock className="h-6 w-6" />
                        <div className="mt-2 text-[30px] font-black leading-none tracking-[-0.03em]">
                            ?
                        </div>
                    </div>
                )}
            </div>

            {/* Ação */}
            {claimed ? (
                <>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-[10px] bg-mir-on-acc py-3 text-[13.5px] font-bold text-mir-acc transition hover:brightness-110 disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Gerar imagem p/ story
                    </button>
                    <p className="mt-2 text-center font-mono text-[10px] opacity-55">
                        compartilhe a façanha
                    </p>
                </>
            ) : (
                <p className="mt-3.5 text-center text-[13px] font-semibold leading-snug">
                    {isLoggedIn
                        ? 'Reivindique essa faixa pra desbloquear seu selo de descoberta.'
                        : 'Entre e crave essa faixa pra ganhar seu selo de descoberta.'}
                </p>
            )}
        </section>
    )
}
