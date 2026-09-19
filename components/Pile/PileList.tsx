'use client'

// A pilha em lista: a mesma linha densa da página de artista.
//
// É a vista que o servidor entrega de verdade (o mosaico só existe depois de
// medir a largura no cliente), então é a de quem não roda JavaScript, a do
// leitor de tela e a de quem quer achar uma faixa pelo nome.
//
// O link de cada faixa é SEMPRE `enderecoDaFaixa(isrc, …)`. Sem ISRC (a fila
// do job ainda não passou pela faixa) o título abre a ficha, que ao menos
// mostra o que se sabe.

import Link from 'next/link'
import RecordCover from '@/components/Club/RecordCover'
import recipes from '@/components/Club/club-recipes.module.css'
import { HEAT_LABEL, type PileTrack } from '@/utils/pileTypes'
import { enderecoDaFaixa } from '@/utils/trackHref'
import styles from './PileList.module.css'

export default function PileList({
    tracks,
    genre,
    onOpen,
}: {
    tracks: PileTrack[]
    genre: string | null
    onOpen: (t: PileTrack) => void
}) {
    const visiveis = tracks.filter((t) => genre === null || t.genre === genre)
    if (visiveis.length === 0) return null

    return (
        <ol className={styles.list} aria-label="A pilha em lista">
            <li className={styles.header} aria-hidden="true">
                <span />
                <span />
                <span>Faixa</span>
                <span>Audiência</span>
            </li>
            {visiveis.map((t, index) => {
                const href = t.isrc
                    ? enderecoDaFaixa(t.isrc, t.artist, t.title)
                    : null
                return (
                    <li key={t.id} className={styles.row}>
                        <span className={`${recipes.smallNumber} ${styles.position}`}>
                            {index + 1}
                        </span>

                        {href ? (
                            <Link
                                href={href}
                                tabIndex={-1}
                                aria-hidden="true"
                                className={styles.coverLink}
                            >
                                <RecordCover
                                    src={t.coverSmall}
                                    alt=""
                                    className={styles.cover}
                                />
                            </Link>
                        ) : (
                            <RecordCover
                                src={t.coverSmall}
                                alt=""
                                className={styles.cover}
                            />
                        )}

                        <div className={styles.who}>
                            <h3 className={styles.title}>
                                {href ? (
                                    <Link href={href}>{t.title}</Link>
                                ) : (
                                    <button type="button" onClick={() => onOpen(t)}>
                                        {t.title}
                                    </button>
                                )}
                            </h3>
                            <p className={styles.context}>
                                <span>{t.artist}</span>
                                <span>
                                    {t.genre} · {HEAT_LABEL[t.heat]}
                                </span>
                            </p>
                        </div>

                        <span
                            className={`${recipes.smallNumber} ${styles.audience}`}
                            title="Audiência no Deezer, de 0 a 100"
                        >
                            <span className={styles.srOnly}>Audiência </span>
                            {t.audiencia}
                        </span>
                    </li>
                )
            })}
        </ol>
    )
}
