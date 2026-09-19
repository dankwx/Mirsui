'use client'

// Uma peça do mosaico: capa como objeto, no vocabulário da home (quinas de
// 3 px, sombra `.sleeve`, inclinação leve que se endireita no hover/foco).
//
// É um <button>: focável na ordem do DOM, Enter/Espaço abrem a ficha, e o
// tooltip aparece tanto no hover quanto no foco. Peças de outro gênero, quando
// há filtro, esmaecem sem sair do lugar — e saem da ordem do teclado e da
// árvore de acessibilidade, senão eram 160 paradas de Tab até a próxima
// peça acesa.

import type { CSSProperties } from 'react'
import RecordCover from '@/components/Club/RecordCover'
import recipes from '@/components/Club/club-recipes.module.css'
import { HEAT_LABEL, type PileTrack } from '@/utils/pileTypes'
import type { PilePiece as Piece } from './pileLayout'
import styles from './PileMosaic.module.css'

export default function PilePiece({
    piece,
    dim,
    onOpen,
}: {
    piece: Piece
    dim: boolean
    onOpen: (t: PileTrack) => void
}) {
    const t = piece.track
    // 250 px nas peças pequenas, que são a maioria; 500 nas grandes.
    const src = piece.size > 170 ? t.cover : t.coverSmall

    return (
        <button
            type="button"
            className={`${styles.slot} ${dim ? styles.dim : ''}`}
            style={
                {
                    left: piece.x,
                    top: piece.y,
                    width: piece.size,
                    height: piece.size,
                    zIndex: piece.z,
                    '--r': `${piece.rot}deg`,
                    '--d': `${piece.delay}ms`,
                } as CSSProperties
            }
            onClick={() => onOpen(t)}
            aria-label={`${t.title}, ${t.artist}`}
            aria-hidden={dim || undefined}
            tabIndex={dim ? -1 : 0}
        >
            <span className={`${recipes.sleeve} ${styles.piece}`}>
                <RecordCover src={src} alt="" />
            </span>

            <span className={`${styles.tip} ${styles[`tip_${piece.align}`]}`}>
                <strong>{t.title}</strong>
                <span className={styles.tipArtist}>{t.artist}</span>
                <span className={styles.tipMeta}>
                    {t.genre} · {HEAT_LABEL[t.heat]} ·{' '}
                    <span className={recipes.smallNumber}>{t.audiencia}</span>
                    /100
                </span>
            </span>
        </button>
    )
}
