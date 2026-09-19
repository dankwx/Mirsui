// Uma linha do feed: capa, quem salvou, faixa, nota e precedência.
//
// Espaçamento apertado de propósito: o feed é a tela de uso frequente, e
// vinte achados não podem virar sete telas de rolagem. Capa de 64 px, uma
// linha por informação, divisor discreto entre achados.

import Link from 'next/link'
import RecordCover from '@/components/Club/RecordCover'
import { trackHref } from '@/utils/trackHref'
import { notaDe, type FeedPost } from './format'
import { Byline, ClaimNote, Precedence } from './FeedBits'
import SaveButton, { type SaveState } from './SaveButton'
import styles from './FeedItem.module.css'

export default function FeedItem({
    post,
    isOwn,
    save,
}: {
    post: FeedPost
    isOwn: boolean
    save: SaveState
}) {
    const href = trackHref(post)
    const nota = notaDe(post)

    return (
        <article className={styles.item}>
            <Link href={href} className={styles.coverLink} tabIndex={-1} aria-hidden="true">
                <RecordCover
                    src={post.track_thumbnail}
                    alt=""
                    className={styles.cover}
                />
            </Link>

            <div className={styles.body}>
                <Byline post={post} isOwn={isOwn} />

                <h3 className={styles.title}>
                    <Link href={href}>{post.track_title}</Link>
                </h3>
                <p className={styles.artist}>{post.artist_name}</p>

                {nota && <ClaimNote text={nota} />}

                <div className={styles.footer}>
                    <Precedence position={post.position} savers={save.savers} />
                    {!isOwn && <SaveButton state={save} />}
                </div>
            </div>
        </article>
    )
}
