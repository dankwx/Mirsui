// O aviso de salto no feed: a toupeira com os riscos de susto quando uma faixa
// que a pessoa salvou sobe forte na semana. É o "eu já ouvia" acontecendo, e
// antes só aparecia para quem abrisse a página da faixa.
//
// Mostra um salto só, o maior. Sem salto, o componente nem é montado.
//
// A ação principal é postar o story da faixa: é o momento em que o achado
// virou notícia, e o story mostra isso pela data do save e pela curva.

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import ToupeiraNoBuraco from '@/components/MirsuiLogo/ToupeiraNoBuraco'
import recipes from '@/components/Club/club-recipes.module.css'
import { dataCompleta } from '@/components/Track/format'
import StoryShareButton from '@/components/Track/StoryShareButton'
import { enderecoDaFaixa } from '@/utils/trackHref'
import type { SaltoDaSemana as Salto } from '@/utils/saltoService'
import type { DadosDoStory } from '@/utils/story'
import styles from './SaltoDaSemana.module.css'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://mirsui.com'

export default function SaltoDaSemana({
    salto,
    story,
}: {
    salto: Salto
    /** null quando a faixa não carregou: o aviso fica só com a curva */
    story: DadosDoStory | null
}) {
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
            <div className={styles.acoes}>
                {story && (
                    <StoryShareButton
                        story={story}
                        trackUri={`isrc:${salto.isrc}`}
                        link={`${SITE}${href}`}
                        origem="salto"
                        variante="compacto"
                    />
                )}
                <Link
                    href={`${href}#observatorio-title`}
                    className={recipes.textLink}
                >
                    Ver a curva <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
            </div>
        </section>
    )
}
