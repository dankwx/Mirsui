'use client'

// Gera a imagem do story (/api/og/selo) e abre a folha de compartilhamento, ou
// baixa o PNG onde não há suporte. Os dados vêm prontos do servidor
// (utils/storyService.ts); aqui só viram endereço.
//
// Duas caras: no registro da página de faixa, o botão de contorno com a
// explicação embaixo; no aviso de salto do feed, o botão principal, compacto.

import { useState } from 'react'
import { Check, ImageDown, Loader2 } from 'lucide-react'
import recipes from '@/components/Club/club-recipes.module.css'
import { capture } from '@/lib/posthog'
import { enderecoDoStory, type DadosDoStory } from '@/utils/story'
import styles from './StoryShareButton.module.css'

interface StoryShareButtonProps {
    story: DadosDoStory
    /** para o evento do PostHog */
    trackUri: string
    /** a página da faixa, para os apps que aceitam texto junto da imagem */
    link?: string | null
    origem: 'faixa' | 'salto'
    variante?: 'recibo' | 'compacto'
}

type Estado = 'parado' | 'gerando' | 'baixado' | 'erro'

export default function StoryShareButton({
    story,
    trackUri,
    link,
    origem,
    variante = 'recibo',
}: StoryShareButtonProps) {
    const [estado, setEstado] = useState<Estado>('parado')

    const gerar = async () => {
        if (estado === 'gerando') return
        setEstado('gerando')
        try {
            const res = await fetch(enderecoDoStory(story))
            if (!res.ok) throw new Error('falha ao gerar')

            const blob = await res.blob()
            const file = new File([blob], 'mirsui.png', { type: 'image/png' })
            capture('track_shared', {
                track_uri: trackUri,
                origem,
                com_pessoa: !!story.pessoa,
                com_subida: !!story.subida,
                com_nota: !!story.pessoa?.nota,
            })

            // Celular: abre a folha de compartilhamento (Instagram etc.).
            // Desktop / sem suporte: baixa o PNG.
            if (
                typeof navigator !== 'undefined' &&
                navigator.canShare?.({ files: [file] })
            ) {
                try {
                    await navigator.share({
                        files: [file],
                        title: `${story.titulo} — ${story.artista}`,
                        ...(link ? { text: link } : {}),
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

    const compacto = variante === 'compacto'
    const icone =
        estado === 'gerando' ? (
            <Loader2 size={15} className={styles.spin} aria-hidden="true" />
        ) : estado === 'baixado' ? (
            <Check size={15} aria-hidden="true" />
        ) : (
            <ImageDown size={15} aria-hidden="true" />
        )
    const rotulo =
        estado === 'baixado'
            ? 'Imagem baixada'
            : compacto
              ? 'Postar no story'
              : 'Compartilhar no story'

    if (compacto) {
        return (
            <div className={styles.compacto}>
                <button
                    type="button"
                    onClick={gerar}
                    disabled={estado === 'gerando'}
                    className={`${recipes.button} ${recipes.buttonSmall}`}
                >
                    {icone}
                    {rotulo}
                </button>
                {estado === 'erro' && (
                    <p className={styles.error} role="alert">
                        Não deu para gerar a imagem. Tente de novo.
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className={styles.wrap}>
            <button
                type="button"
                onClick={gerar}
                disabled={estado === 'gerando'}
                className={`${recipes.outlineButton} ${styles.button}`}
            >
                {icone}
                {rotulo}
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
