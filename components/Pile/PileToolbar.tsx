'use client'

// Filtros de gênero e as duas ações da pilha, numa linha só.
//
// A barra gruda logo abaixo do header enquanto o mosaico rola: são 2.000 px
// de capas, e sem isto os filtros sumiam nos primeiros 300 px. No celular ela
// não gruda — junto com o header seriam 150 px de tela presos.

import { LayoutGrid, List, Shuffle } from 'lucide-react'
import recipes from '@/components/Club/club-recipes.module.css'
import styles from './PileToolbar.module.css'

export type Vista = 'mosaico' | 'lista'

export default function PileToolbar({
    generos,
    total,
    genre,
    onGenre,
    vista,
    onVista,
    onEmbaralhar,
}: {
    generos: { nome: string; total: number }[]
    total: number
    genre: string | null
    onGenre: (g: string | null) => void
    vista: Vista
    onVista: (v: Vista) => void
    onEmbaralhar: () => void
}) {
    const filtro = (nome: string | null, rotulo: string, n: number) => {
        const ativo = genre === nome
        return (
            <button
                key={nome ?? 'tudo'}
                type="button"
                aria-pressed={ativo}
                onClick={() => onGenre(nome)}
                className={ativo ? recipes.filterActive : recipes.filter}
            >
                {rotulo}
                {ativo && (
                    <span className={`${recipes.smallNumber} ${styles.count}`}>
                        {n}
                    </span>
                )}
            </button>
        )
    }

    return (
        <div className={styles.toolbar}>
            <div
                className={`${recipes.filters} ${styles.filters}`}
                role="group"
                aria-label="Filtrar por gênero"
            >
                {filtro(null, 'Tudo', total)}
                {generos.map((g) => filtro(g.nome, g.nome, g.total))}
            </div>

            <div className={styles.actions}>
                {vista === 'mosaico' && (
                    <button
                        type="button"
                        onClick={onEmbaralhar}
                        className={`${recipes.textLink} ${styles.action}`}
                    >
                        <Shuffle size={16} aria-hidden="true" />
                        Embaralhar
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onVista(vista === 'mosaico' ? 'lista' : 'mosaico')}
                    className={`${recipes.textLink} ${styles.action}`}
                >
                    {vista === 'mosaico' ? (
                        <>
                            <List size={16} aria-hidden="true" />
                            Ver em lista
                        </>
                    ) : (
                        <>
                            <LayoutGrid size={16} aria-hidden="true" />
                            Ver mosaico
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
