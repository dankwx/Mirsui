'use client'

import { useEffect, useRef, useState } from 'react'
import { Disc3 } from 'lucide-react'
import styles from './RecordCover.module.css'

export default function RecordCover({
    src,
    alt,
    className = '',
    priority = false,
}: {
    src: string | null
    alt: string
    className?: string
    /** capa principal da página: carrega antes, sem esperar rolagem */
    priority?: boolean
}) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null)
    const ref = useRef<HTMLImageElement>(null)

    useEffect(() => {
        // Em página renderizada no servidor o <img> já vem no HTML, e uma capa
        // morta (404 do CDN) falha antes da hidratação pendurar o `onError`.
        // Evento perdido não redispara, então o ícone de imagem quebrada
        // ficava na tela. `complete` com `naturalWidth` zero é como perguntar
        // ao DOM o que aconteceu antes do React chegar — mesma técnica de
        // FotoDePerfil.
        const img = ref.current
        if (src && img?.complete && img.naturalWidth === 0) setFailedSrc(src)
    }, [src])

    return (
        <span
            className={`${styles.cover} ${className}`}
            data-record-cover="true"
        >
            {src && failedSrc !== src ? (
                // Catalogue images already have CDN-sized variants.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    ref={ref}
                    src={src}
                    alt={alt}
                    width={250}
                    height={250}
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : undefined}
                    decoding="async"
                    onError={() => setFailedSrc(src)}
                />
            ) : (
                <span
                    className={styles.coverFallback}
                    role="img"
                    aria-label={alt}
                >
                    <Disc3 size={42} strokeWidth={1} />
                </span>
            )}
        </span>
    )
}
