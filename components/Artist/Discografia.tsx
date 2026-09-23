'use client'

// A discografia: Álbuns, Singles e Coletâneas em filtros sublinhados e um
// grid de capas 1:1 com nome e ano abaixo — o mesmo desenho do Acervo da home.
//
// Não existe página de álbum no Mirsui, então cada capa abre o álbum no
// Deezer, em aba nova, com a seta diagonal que o guia reserva para acesso.

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import RecordCover from '@/components/Club/RecordCover'
import recipes from '@/components/Club/club-recipes.module.css'
import type { AlbumDaVitrine } from '@/utils/artistPageService'
import { ano } from './format'
import styles from './Discografia.module.css'

type Gaveta = AlbumDaVitrine['album_type']

const GAVETAS: { id: Gaveta; label: string; vazio: string }[] = [
    {
        id: 'unknown',
        label: 'Lançamentos',
        vazio: 'Nenhum lançamento no acervo.',
    },
    { id: 'album', label: 'Álbuns', vazio: 'Nenhum álbum listado no Deezer.' },
    {
        id: 'single',
        label: 'Singles',
        vazio: 'Nenhum single ou EP listado no Deezer.',
    },
    {
        id: 'compilation',
        label: 'Coletâneas',
        vazio: 'Nenhuma coletânea listada no Deezer.',
    },
]

export default function Discografia({
    albuns,
    fonte,
}: {
    albuns: AlbumDaVitrine[]
    fonte: 'observatorio' | 'deezer'
}) {
    const gavetas =
        fonte === 'observatorio' ? GAVETAS.slice(0, 1) : GAVETAS.slice(1)
    const contagem = (g: Gaveta) =>
        albuns.filter((a) => a.album_type === g).length

    // Abre na primeira gaveta que tem algo, para a página não começar vazia
    // num artista que só tem singles.
    const [ativa, setAtiva] = useState<Gaveta>(
        () => gavetas.find((g) => contagem(g.id) > 0)?.id ?? gavetas[0].id
    )

    const selecionada = gavetas.some((g) => g.id === ativa)
        ? ativa
        : gavetas[0].id
    const lista = albuns.filter((a) => a.album_type === selecionada)
    const gaveta = gavetas.find((g) => g.id === selecionada)!

    return (
        <section className={styles.section} aria-labelledby="discografia-title">
            <div className={styles.heading}>
                <h2 id="discografia-title">
                    {fonte === 'observatorio'
                        ? 'Lançamentos no acervo'
                        : 'Discografia'}
                </h2>
                <p>
                    {fonte === 'observatorio'
                        ? `${albuns.length} ${albuns.length === 1 ? 'lançamento medido' : 'lançamentos medidos'} pelo Observatório.`
                        : albuns.length === 0
                          ? 'O Deezer ainda não lista lançamentos deste artista.'
                          : `${albuns.length} ${albuns.length === 1 ? 'lançamento' : 'lançamentos'} no Deezer.`}
                </p>
            </div>

            {albuns.length > 0 && (
                <>
                    {fonte === 'deezer' && (
                        <div
                            className={recipes.filters}
                            role="group"
                            aria-label="Filtrar a discografia"
                        >
                            {gavetas.map((g) => {
                                const n = contagem(g.id)
                                return (
                                    <button
                                        type="button"
                                        key={g.id}
                                        aria-pressed={selecionada === g.id}
                                        onClick={() => setAtiva(g.id)}
                                        className={
                                            selecionada === g.id
                                                ? recipes.filterActive
                                                : recipes.filter
                                        }
                                    >
                                        {g.label}
                                        {n > 0 && (
                                            <span
                                                className={`${recipes.smallNumber} ${styles.count}`}
                                            >
                                                {n}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {lista.length === 0 ? (
                        <p className={styles.empty} role="status">
                            {gaveta.vazio}
                        </p>
                    ) : (
                        <ul
                            className={styles.grid}
                            key={selecionada}
                            aria-live="polite"
                            aria-label={gaveta.label}
                        >
                            {lista.map((a) => {
                                const year = ano(a.release_date)
                                return (
                                    <li key={a.id} className={styles.item}>
                                        <a
                                            href={a.external_urls.spotify}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.link}
                                            aria-label={`${a.name}${year ? `, ${year}` : ''} — abrir no Deezer`}
                                        >
                                            <span className={styles.art}>
                                                <RecordCover
                                                    src={
                                                        a.images[0]?.url ?? null
                                                    }
                                                    alt=""
                                                />
                                                <span className={styles.arrow}>
                                                    <ArrowUpRight size={19} />
                                                </span>
                                            </span>
                                            <span
                                                className={styles.name}
                                                title={a.name}
                                            >
                                                {a.name}
                                            </span>
                                            <span className={styles.year}>
                                                {year ? (
                                                    <span
                                                        className={
                                                            recipes.smallNumber
                                                        }
                                                    >
                                                        {year}
                                                    </span>
                                                ) : (
                                                    'Sem data'
                                                )}
                                                {a.total_tracks > 0 && (
                                                    <>
                                                        {' · '}
                                                        {a.total_tracks}{' '}
                                                        {a.total_tracks === 1
                                                            ? 'faixa'
                                                            : 'faixas'}
                                                    </>
                                                )}
                                            </span>
                                        </a>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </>
            )}
        </section>
    )
}
