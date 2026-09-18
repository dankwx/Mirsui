import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import FotoDePerfil from '@/components/FotoDePerfil'
import { diaMes, trackHref } from './landingHelpers'
import type { RecentActivityItem } from '@/utils/homepageService'
import type { PessoaDaCena } from '@/utils/homeService'
import RecordCover from '@/components/Club/RecordCover'
import styles from './Club.module.css'

export default function Cena({
    achados,
    pessoas,
}: {
    achados: RecentActivityItem[]
    pessoas: PessoaDaCena[]
}) {
    return (
        <section
            id="cena"
            className={`${styles.container} ${styles.scene}`}
            aria-labelledby="scene-title"
        >
            <div className={styles.sectionHeading}>
                <h2 id="scene-title">Música boa circula.</h2>
                <p>Por trás de cada achado, alguém que deu o play antes.</p>
            </div>
            {achados.length > 0 ? (
                <div className={styles.activityGrid}>
                    {achados.slice(0, 4).map((item) => {
                        const name =
                            item.profiles?.display_name ||
                            item.profiles?.username ||
                            'Alguém da cena'
                        return (
                            <article key={item.id} className={styles.activity}>
                                <div className={styles.activityPerson}>
                                    <span className={styles.avatar}>
                                        <FotoDePerfil
                                            loading="lazy"
                                            src={item.profiles?.avatar_url}
                                            className={styles.avatarImage}
                                        >
                                            {name[0]}
                                        </FotoDePerfil>
                                    </span>
                                    <div>
                                        {item.profiles?.username ? (
                                            <Link
                                                href={`/user/${item.profiles.username}`}
                                            >
                                                {name}
                                            </Link>
                                        ) : (
                                            <strong>{name}</strong>
                                        )}
                                        <span>
                                            salvou em {diaMes(item.claimedat)}
                                        </span>
                                    </div>
                                    <ArrowUpRight
                                        size={16}
                                        aria-hidden="true"
                                    />
                                </div>
                                <Link
                                    href={trackHref(item)}
                                    className={styles.activityTrack}
                                >
                                    <RecordCover
                                        src={item.track_thumbnail}
                                        alt={`Capa de ${item.track_title}`}
                                    />
                                    <div>
                                        <h3>{item.track_title}</h3>
                                        <p>{item.artist_name}</p>
                                        <span className={styles.position}>
                                            {item.position}º a descobrir
                                        </span>
                                    </div>
                                </Link>
                                {item.claim_message &&
                                    item.claim_message.trim().length >= 5 && (
                                        <p className={styles.activityQuote}>
                                            “{item.claim_message.trim()}”
                                        </p>
                                    )}
                            </article>
                        )
                    })}
                </div>
            ) : (
                <p className={styles.emptyScene}>
                    A cena está começando. Seu próximo achado pode abrir essa
                    conversa.
                </p>
            )}
            <div className={styles.sceneBottom}>
                <div className={styles.community}>
                    {pessoas.length > 0 && (
                        <div className={styles.avatarStack}>
                            {pessoas.slice(0, 4).map((p) => (
                                <Link
                                    href={`/user/${p.username}`}
                                    key={p.username}
                                    className={styles.avatar}
                                    aria-label={`Ver acervo de ${p.nome}`}
                                >
                                    <FotoDePerfil
                                        loading="lazy"
                                        src={p.avatar}
                                        className={styles.avatarImage}
                                    >
                                        {p.nome[0]}
                                    </FotoDePerfil>
                                </Link>
                            ))}
                        </div>
                    )}
                    <p>A cena é pequena. O repertório, não.</p>
                </div>
                <Link href="/feed" className={styles.textLink}>
                    Ver todos os achados <ArrowUpRight size={17} />
                </Link>
            </div>
        </section>
    )
}
