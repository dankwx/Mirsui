// A porta da pilha, na lateral do feed.
//
// As quatro capas são os últimos achados únicos da cena (`getRecentClaims`),
// e cada uma leva à ficha da faixa. Antes elas apareciam duas vezes nesta
// tela — num leque decorativo e numa lista "subindo na cena" que prometia
// tendência sem medir nada. Agora aparecem uma vez, pequenas, dizendo o que
// são: as últimas a entrar na pilha. O nome fica no aria-label porque as
// mesmas faixas estão, com nome, a poucos centímetros no feed.

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import RecordCover from '@/components/Club/RecordCover'
import recipes from '@/components/Club/club-recipes.module.css'
import { trackHref } from '@/utils/trackHref'
import type { RecentClaim } from '@/utils/feedService.backend'
import styles from './PileInvite.module.css'

export default function PileInvite({
    claims,
    loadFailed = false,
}: {
    claims: RecentClaim[]
    /** a busca falhou — diferente de "ninguém salvou nada" */
    loadFailed?: boolean
}) {
    const recentes = claims.slice(0, 4)

    return (
        <section className={styles.section} aria-labelledby="pile-title">
            <h2 id="pile-title" className={styles.title}>
                A pilha
            </h2>
            <p className={styles.lead}>
                Tudo que a cena já salvou, num lugar só. Capa grande, muita
                gente; capa pequena, quase ninguém — ainda.
            </p>

            {recentes.length > 0 ? (
                <div className={styles.recent}>
                    <ul className={styles.strip} aria-label="As últimas faixas a entrar na pilha">
                        {recentes.map((claim) => (
                            <li key={claim.id}>
                                <Link
                                    href={trackHref(claim)}
                                    className={styles.record}
                                    aria-label={`${claim.track_title}, ${claim.artist_name}`}
                                >
                                    <RecordCover
                                        src={claim.track_thumbnail}
                                        alt=""
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <p className={styles.label}>As últimas a entrar</p>
                </div>
            ) : (
                <p className={styles.empty}>
                    {loadFailed
                        ? 'Não deu para carregar as últimas capas agora.'
                        : 'Ninguém salvou nada ainda. A pilha começa com o seu primeiro achado.'}
                </p>
            )}

            <Link href="/pilha" className={`${recipes.button} ${styles.cta}`}>
                Revirar a pilha
                <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
        </section>
    )
}
