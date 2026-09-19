// As peças que o destaque e as linhas do feed repetem: quem salvou (avatar,
// nome e tempo), a nota escrita ao salvar e a linha de precedência.
//
// Ficam num arquivo só porque são pequenas, sem estado, e mudam juntas.

import Link from 'next/link'
import FotoDePerfil from '@/components/FotoDePerfil'
import recipes from '@/components/Club/club-recipes.module.css'
import { iniciais, nomeDe, ordinal, quando, type FeedPost } from './format'
import styles from './FeedBits.module.css'

/** "[avatar] Nome salvou · há 5d" — o nome leva ao perfil. */
export function Byline({
    post,
    isOwn,
    size = 'small',
}: {
    post: FeedPost
    isOwn: boolean
    size?: 'small' | 'large'
}) {
    const nome = nomeDe(post, isOwn)
    const tempo = quando(post.claimedat)

    return (
        <p className={`${styles.byline} ${size === 'large' ? styles.bylineLarge : ''}`}>
            <Link href={`/user/${post.username}`} className={styles.person}>
                <span className={styles.avatar}>
                    <FotoDePerfil
                        src={post.avatar_url}
                        loading="lazy"
                        className={styles.avatarImage}
                    >
                        {iniciais(post.display_name || post.username || '') || '·'}
                    </FotoDePerfil>
                </span>
                <strong>{nome}</strong>
            </Link>
            <span>
                salvou
                {tempo && (
                    <>
                        {' '}
                        <span className={styles.when}>{tempo}</span>
                    </>
                )}
            </span>
        </p>
    )
}

/** A nota que a pessoa escreveu ao salvar. É a camada humana do feed. */
export function ClaimNote({ text }: { text: string }) {
    return <p className={styles.note}>“{text}”</p>
}

/** "1º a descobrir · 3 já salvaram" — só o primeiro leva acento. */
export function Precedence({
    position,
    savers,
}: {
    position: number | null | undefined
    savers: number
}) {
    const ord = ordinal(position)
    if (!ord && savers <= 1) return null

    return (
        <p className={styles.precedence}>
            {ord && (
                <span className={position === 1 ? styles.first : undefined}>
                    <span className={recipes.smallNumber}>{ord}</span> a
                    descobrir
                </span>
            )}
            {ord && savers > 1 && <span aria-hidden="true"> · </span>}
            {savers > 1 && (
                <span>
                    <span className={recipes.smallNumber}>{savers}</span> já
                    salvaram
                </span>
            )}
        </p>
    )
}
