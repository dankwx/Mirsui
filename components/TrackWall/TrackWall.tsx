'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

function Chevron({ dir }: { dir: 'left' | 'right' }) {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
        </svg>
    )
}

/**
 * Carrossel horizontal do "Subindo na cena".
 *
 * Existe só para dar a affordance que faltava: setas no desktop e fades nas
 * bordas mostrando que ainda há faixas para os lados. O scroll continua sendo
 * nativo (swipe/trackpad/teclado seguem funcionando sem JS).
 */
export default function TrackWall({
    children,
}: {
    children: React.ReactNode
}) {
    const railRef = useRef<HTMLDivElement>(null)
    const [atStart, setAtStart] = useState(true)
    const [atEnd, setAtEnd] = useState(true)

    const sync = useCallback(() => {
        const el = railRef.current
        if (!el) return
        const max = el.scrollWidth - el.clientWidth
        setAtStart(el.scrollLeft <= 2)
        setAtEnd(el.scrollLeft >= max - 2)
    }, [])

    useEffect(() => {
        const el = railRef.current
        if (!el) return
        sync()
        el.addEventListener('scroll', sync, { passive: true })
        const ro = new ResizeObserver(sync)
        ro.observe(el)
        return () => {
            el.removeEventListener('scroll', sync)
            ro.disconnect()
        }
    }, [sync])

    const nudge = (direction: 1 | -1) => {
        const el = railRef.current
        if (!el) return
        el.scrollBy({
            left: direction * Math.round(el.clientWidth * 0.8),
            behavior: 'smooth',
        })
    }

    return (
        <div className="hwall-wrap">
            <span
                className={'hwall-fade left' + (atStart ? '' : ' is-on')}
                aria-hidden="true"
            />
            <span
                className={'hwall-fade right' + (atEnd ? '' : ' is-on')}
                aria-hidden="true"
            />

            <button
                type="button"
                className="hwall-nav prev"
                onClick={() => nudge(-1)}
                disabled={atStart}
                aria-label="Ver faixas anteriores"
            >
                <Chevron dir="left" />
            </button>

            <div className="hwall" ref={railRef}>
                {children}
            </div>

            <button
                type="button"
                className="hwall-nav next"
                onClick={() => nudge(1)}
                disabled={atEnd}
                aria-label="Ver mais faixas"
            >
                <Chevron dir="right" />
            </button>
        </div>
    )
}
