'use client'

// A pilha, do lado do cliente: filtro, semente do mosaico, vista e ficha.
//
// As duas vistas ficam SEMPRE no DOM, alternadas por CSS, e não montadas
// condicionalmente. O motivo é o mosaico: as posições dele são calculadas em
// px a partir da largura medida pelo ResizeObserver, que no servidor não roda
// — então o HTML que sai do servidor tem zero peça de mosaico, e as faixas
// existem lá só como JSON do payload do React.
//
// Renderizando a lista de verdade, o conteúdo da Pilha passa a existir em HTML
// semântico para quem não executa JavaScript. E não é só crawler: ninguém acha
// uma faixa específica varrendo 168 capas sem título, então a lista é uma
// vista útil por si — é a do leitor de tela e a da conexão lenta.

import { useCallback, useMemo, useState } from 'react'
import type { PileTrack } from '@/utils/pileTypes'
import PileToolbar, { type Vista } from './PileToolbar'
import PileMosaic from './PileMosaic'
import PileList from './PileList'
import PieceSheet from './PieceSheet'
import styles from './Pile.module.css'

export default function Pile({ tracks }: { tracks: PileTrack[] }) {
    const [run, setRun] = useState(0)
    const [genre, setGenre] = useState<string | null>(null)
    const [open, setOpen] = useState<PileTrack | null>(null)
    const [vista, setVista] = useState<Vista>('mosaico')

    // Os filtros vêm das faixas que chegaram, não de uma lista fixa: os
    // gêneros são os do Deezer e mudam conforme o Observatório cresce.
    // Array.from em vez de espalhar o Set: o target do tsconfig é anterior a
    // es2015 e não itera Set sem downlevelIteration.
    const generos = useMemo(() => {
        const porGenero = new Map<string, number>()
        for (const t of tracks)
            porGenero.set(t.genre, (porGenero.get(t.genre) ?? 0) + 1)
        return Array.from(porGenero.entries())
            .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
            .map(([nome, total]) => ({ nome, total }))
    }, [tracks])

    const matches = useMemo(
        () =>
            genre
                ? tracks.filter((t) => t.genre === genre).length
                : tracks.length,
        [genre, tracks]
    )

    // Embaralhar troca a semente; o filtro ativo continua onde está.
    const embaralhar = useCallback(() => setRun((r) => r + 1), [])
    const fechar = useCallback(() => setOpen(null), [])

    return (
        <div className={styles.pile}>
            <PileToolbar
                generos={generos}
                total={tracks.length}
                genre={genre}
                onGenre={setGenre}
                vista={vista}
                onVista={setVista}
                onEmbaralhar={embaralhar}
            />

            {genre !== null && matches === 0 && (
                <p className={styles.empty} role="status">
                    Nenhuma faixa de {genre} na pilha hoje.
                </p>
            )}

            <div hidden={vista !== 'lista'} className={styles.view}>
                <PileList tracks={tracks} genre={genre} onOpen={setOpen} />
            </div>

            <div hidden={vista !== 'mosaico'} className={styles.view}>
                <PileMosaic
                    tracks={tracks}
                    run={run}
                    genre={genre}
                    onOpen={setOpen}
                />
            </div>

            <PieceSheet track={open} onClose={fechar} />
        </div>
    )
}
