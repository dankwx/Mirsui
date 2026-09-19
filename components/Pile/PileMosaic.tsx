'use client'

// O mosaico: as capas empilhadas por gravidade.
//
// A pilha só existe depois de medir: as posições são em px, calculadas a
// partir da largura real do palco (pileLayout.ts). A queda é uma animação CSS
// da posição -Y até o repouso já calculado — nada de loop de rAF.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { PileTrack } from '@/utils/pileTypes'
import { packPile } from './pileLayout'
import PilePiece from './PilePiece'
import styles from './PileMosaic.module.css'

export default function PileMosaic({
    tracks,
    run,
    genre,
    onOpen,
}: {
    tracks: PileTrack[]
    /** semente: muda a cada "Embaralhar" e remonta as peças para caírem de novo */
    run: number
    genre: string | null
    onOpen: (t: PileTrack) => void
}) {
    const stageRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        const el = stageRef.current
        if (!el) return
        const ro = new ResizeObserver(([entry]) => {
            setWidth(Math.round(entry.contentRect.width))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const layout = useMemo(
        () => packPile(tracks, width, run + 1),
        [tracks, width, run]
    )

    return (
        <div
            ref={stageRef}
            className={styles.stage}
            style={{ height: layout.height || 620 }}
            role="group"
            aria-label="Mosaico da pilha"
        >
            {layout.pieces.map((p) => (
                <PilePiece
                    key={`${run}-${p.track.id}`}
                    piece={p}
                    dim={genre !== null && p.track.genre !== genre}
                    onOpen={onOpen}
                />
            ))}

            {width === 0 && (
                <p className={styles.measuring} aria-hidden="true">
                    Despejando…
                </p>
            )}
        </div>
    )
}
