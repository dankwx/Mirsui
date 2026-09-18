'use client'

import { useState } from 'react'
import { Disc3 } from 'lucide-react'
import styles from './RecordCover.module.css'

export default function RecordCover({
    src,
    alt,
    className = '',
}: {
    src: string | null
    alt: string
    className?: string
}) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null)

    return (
        <span
            className={`${styles.cover} ${className}`}
            data-record-cover="true"
        >
            {src && failedSrc !== src ? (
                // Catalogue images already have CDN-sized variants.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt={alt}
                    width={250}
                    height={250}
                    loading="lazy"
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
