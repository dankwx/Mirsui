// O achado mais recente, em destaque. É o mesmo dado das linhas abaixo, só
// que com a capa no tamanho de objeto: a página abre com música, não com um
// título.

import Link from 'next/link'
import RecordCover from '@/components/Club/RecordCover'
import recipes from '@/components/Club/club-recipes.module.css'
import { trackHref } from '@/utils/trackHref'
import { notaDe, type FeedPost } from './format'
import { Byline, ClaimNote, Precedence } from './FeedBits'
import SaveButton, { type SaveState } from './SaveButton'
import styles from './FeedHighlight.module.css'

export default function FeedHighlight({
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
        <article className={styles.highlight} aria-label="Último achado">
            <Link href={href} className={styles.coverLink} tabIndex={-1} aria-hidden="true">
                <RecordCover
                    src={post.track_thumbnail}
                    alt=""
                    className={`${recipes.sleeve} ${styles.cover}`}
                    priority
                />
            </Link>

            <div className={styles.head}>
                <p className={styles.eyebrow}>Último achado</p>
                <Byline post={post} isOwn={isOwn} size="large" />
            </div>

            <div className={styles.body}>
                <h2 className={styles.title}>
                    <Link href={href}>{post.track_title}</Link>
                </h2>
                <p className={styles.artist}>
                    {post.artist_name}
                    {post.album_name && post.album_name !== post.track_title && (
                        <span className={styles.album}> · {post.album_name}</span>
                    )}
                </p>

                {nota && <ClaimNote text={nota} />}

                <div className={styles.footer}>
                    {!isOwn && <SaveButton state={save} size="large" />}
                    <Precedence position={post.position} savers={save.savers} />
                </div>
            </div>
        </article>
    )
}
