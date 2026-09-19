'use client'

// Gera a imagem do selo (/api/og/selo) e abre a folha de compartilhamento, ou
// baixa o PNG onde não há suporte. O retorno é inline, abaixo do botão.

import { useState } from 'react'
import { Check, ImageDown, Loader2 } from 'lucide-react'
import recipes from '@/components/Club/club-recipes.module.css'
import { capture } from '@/lib/posthog'
import styles from './StoryShareButton.module.css'

interface StoryShareButtonProps {
    trackUri: string
    trackTitle: string
    artistName: string
    albumImageUrl: string
    year: number | null
    totalClaims: number
}

type Estado = 'parado' | 'gerando' | 'baixado' | 'erro'

export default function StoryShareButton({
    trackUri,
    trackTitle,
    artistName,
    albumImageUrl,
    year,
    totalClaims,
}: StoryShareButtonProps) {
    const [estado, setEstado] = useState<Estado>('parado')

    const gerar = async () => {
        if (estado === 'gerando') return
        setEstado('gerando')
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
            capture('track_shared', { track_uri: trackUri })

            // Celular: abre a folha de compartilhamento (Instagram etc.).
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
                setEstado('parado')
            } else {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'mirsui.png'
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
                setEstado('baixado')
                setTimeout(() => setEstado('parado'), 3000)
            }
        } catch {
            setEstado('erro')
        }
    }

    return (
        <div className={styles.wrap}>
            <button
                type="button"
                onClick={gerar}
                disabled={estado === 'gerando'}
                className={`${recipes.outlineButton} ${styles.button}`}
            >
                {estado === 'gerando' ? (
                    <Loader2
                        size={15}
                        className={styles.spin}
                        aria-hidden="true"
                    />
                ) : estado === 'baixado' ? (
                    <Check size={15} aria-hidden="true" />
                ) : (
                    <ImageDown size={15} aria-hidden="true" />
                )}
                {estado === 'baixado'
                    ? 'Imagem baixada'
                    : 'Compartilhar no story'}
            </button>
            <p
                className={estado === 'erro' ? styles.error : styles.note}
                role={estado === 'erro' ? 'alert' : undefined}
            >
                {estado === 'erro'
                    ? 'Não deu para gerar a imagem. Tente de novo.'
                    : 'Gera uma imagem pronta para o Instagram.'}
            </p>
        </div>
    )
}
