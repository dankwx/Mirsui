'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { GeneroDoAcervo } from '@/utils/homeService'
import { enderecoDaFaixa } from '@/utils/trackHref'
import { editorialRecords } from './editorialRecords'
import RecordCover from '@/components/Club/RecordCover'
import styles from './Club.module.css'

export default function Acervo({ generos }: { generos: GeneroDoAcervo[] }) {
    const [active, setActive] = useState('Seleção da casa')
    const selected = generos.find((g) => g.nome === active)
    const records = selected
        ? selected.faixas.map((f) => ({
              title: f.titulo,
              artist: f.artista,
              href: f.isrc
                  ? enderecoDaFaixa(f.isrc, f.artista, f.titulo)
                  : '/pilha',
              cover: f.md5
                  ? `https://cdn-images.dzcdn.net/images/cover/${f.md5}/250x250-000000-80-0-0.jpg`
                  : null,
          }))
        : editorialRecords.map((r) => ({
              ...r,
              cover: r.cover.replace('.webp', '-small.webp'),
              href: enderecoDaFaixa(r.isrc, r.artist, r.title),
          }))

    return (
        <section
            id="acervo"
            className={`${styles.container} ${styles.discovery}`}
            aria-labelledby="discovery-title"
        >
            <div className={styles.sectionHeading}>
                <h2 id="discovery-title">Saia do repeat.</h2>
                <p>
                    Seu próximo favorito pode estar onde você ainda não
                    procurou.
                </p>
            </div>
            <div
                className={styles.filters}
                role="group"
                aria-label="Filtrar músicas por gênero"
            >
                {['Seleção da casa', ...generos.map((g) => g.nome)].map(
                    (name) => (
                        <button
                            type="button"
                            key={name}
                            aria-pressed={active === name}
                            onClick={() => setActive(name)}
                            className={
                                active === name
                                    ? styles.filterActive
                                    : styles.filter
                            }
                        >
                            {name === 'Rap/Funk Brasileiro'
                                ? 'Rap & funk'
                                : name === 'Samba/Pagode'
                                  ? 'Samba'
                                  : name === 'Rap/Hip Hop'
                                    ? 'Hip hop'
                                    : name}
                        </button>
                    )
                )}
            </div>
            <div
                className={styles.albumGrid}
                key={active}
                aria-live="polite"
                aria-label={`Músicas: ${active}`}
            >
                {records.map((record) => (
                    <Link
                        className={styles.album}
                        href={record.href}
                        key={record.href + record.title}
                    >
                        <div className={styles.albumArt}>
                            <RecordCover
                                src={record.cover}
                                alt={`Capa de ${record.title}, de ${record.artist}`}
                            />
                            <span className={styles.albumArrow}>
                                <ArrowUpRight size={21} />
                            </span>
                        </div>
                        <h3 title={record.title}>{record.title}</h3>
                        <p>{record.artist}</p>
                    </Link>
                ))}
            </div>
            <div className={styles.discoveryBottom}>
                <p>
                    {selected
                        ? `${selected.total.toLocaleString('pt-BR')} faixas de ${selected.nome} no acervo.`
                        : 'Sons brasileiros, ouvidos bem abertos.'}
                </p>
                <Link className={styles.textLink} href="/pilha">
                    Revirar a pilha <ArrowUpRight size={17} />
                </Link>
            </div>
        </section>
    )
}
