// O aviso de salto no feed: a toupeira com os riscos de susto quando uma faixa
// que a pessoa salvou sobe forte na semana. É o "eu já ouvia" acontecendo, e
// antes só aparecia para quem abrisse a página da faixa.
//
// Mostra um salto só, o maior. Sem salto, o componente nem é montado.

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import ToupeiraNoBuraco from '@/components/MirsuiLogo/ToupeiraNoBuraco'
import recipes from '@/components/Club/club-recipes.module.css'
import { dataCompleta } from '@/components/Track/format'
import { enderecoDaFaixa } from '@/utils/trackHref'
import type { SaltoDaSemana as Salto } from '@/utils/saltoService'
import styles from './SaltoDaSemana.module.css'

export default function SaltoDaSemana({ salto }: { salto: Salto }) {
    const href = enderecoDaFaixa(salto.isrc, salto.artistName, salto.title)
    const quando =
        salto.salvaCom != null
            ? `você salvou quando ela estava em ${salto.salvaCom}`
            : salto.salvaEm
              ? `no seu acervo desde ${dataCompleta(salto.salvaEm)}`
              : null

    return (
        <section className={styles.salto} aria-labelledby="salto-titulo">
            <ToupeiraNoBuraco nivel={3} size={46} className={styles.toupeira} />
            <div className={styles.texto}>
                <p id="salto-titulo" className={styles.titulo}>
                    <Link href={href}>{salto.title}</Link> subiu de{' '}
                    <span className={recipes.smallNumber}>{salto.antes}</span>{' '}
                    para{' '}
                    <span className={recipes.smallNumber}>{salto.agora}</span>{' '}
                    de audiência nesta semana.
                </p>
                <p className={styles.apoio}>
                    {salto.artistName}
                    {quando ? ` · ${quando}` : ''}
                </p>
            </div>
            <Link
                href={`${href}#observatorio-title`}
                className={`${recipes.textLink} ${styles.curva}`}
            >
                Ver a curva <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
        </section>
    )
}
