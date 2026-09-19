// Quem chegou antes: os primeiros a salvar esta faixa, em ordem de chegada.
//
// A ordem é o conteúdo. A posição vem em número pequeno, o nome é o link, a
// data fecha a linha. Quem chegou primeiro ganha a cor de acento no lugar de
// mais um selo.

import Link from 'next/link'
import FotoDePerfil from '@/components/FotoDePerfil'
import recipes from '@/components/Club/club-recipes.module.css'
import type { QuemSalvou as Salvamento } from '@/utils/trackClaims'
import { dataCompleta, iniciais, nomeDe, perfilDe } from './format'
import styles from './QuemSalvou.module.css'

interface QuemSalvouProps {
    salvamentos: Salvamento[]
    total: number
    /** id de quem está olhando, para marcar a própria linha */
    viewerId?: string | null
}

export default function QuemSalvou({
    salvamentos,
    total,
    viewerId,
}: QuemSalvouProps) {
    const restantes = Math.max(0, total - salvamentos.length)

    return (
        <section className={styles.section} aria-labelledby="quem-salvou-title">
            <div className={styles.heading}>
                <h2 id="quem-salvou-title">Quem chegou antes</h2>
                <p>
                    {total === 0
                        ? 'Ninguém registrou esta faixa ainda.'
                        : total === 1
                          ? 'Uma pessoa guarda esta faixa no acervo.'
                          : `${total} pessoas guardam esta faixa no acervo.`}
                </p>
            </div>

            {salvamentos.length === 0 ? (
                <p className={styles.empty}>
                    O primeiro registro fica marcado para sempre. Pode ser o
                    seu.
                </p>
            ) : (
                <ol className={styles.list}>
                    {salvamentos.map((s, index) => {
                        const perfil = perfilDe(s.profiles)
                        const nome = nomeDe(perfil)
                        const posicao = s.position ?? index + 1
                        const primeiro = posicao === 1
                        const voce = !!viewerId && s.user_id === viewerId
                        const href = perfil?.username
                            ? `/user/${perfil.username}`
                            : null

                        return (
                            <li
                                key={s.user_id}
                                className={`${styles.row} ${primeiro ? styles.first : ''}`}
                            >
                                <span
                                    className={`${recipes.smallNumber} ${styles.position}`}
                                >
                                    {posicao}º
                                </span>
                                <span className={styles.avatar}>
                                    <FotoDePerfil
                                        src={perfil?.avatar_url}
                                        loading="lazy"
                                        className={styles.avatarImage}
                                    >
                                        {iniciais(nome) || '·'}
                                    </FotoDePerfil>
                                </span>
                                <div className={styles.who}>
                                    {href ? (
                                        <Link href={href}>{nome}</Link>
                                    ) : (
                                        <strong>{nome}</strong>
                                    )}
                                    <span>
                                        {primeiro
                                            ? 'chegou primeiro'
                                            : 'salvou'}
                                        {voce && ' · você'}
                                    </span>
                                </div>
                                <span
                                    className={`${recipes.smallNumber} ${styles.date}`}
                                >
                                    {dataCompleta(s.claimedat)}
                                </span>
                            </li>
                        )
                    })}
                </ol>
            )}

            {restantes > 0 && (
                <p className={styles.more}>
                    e mais {restantes} {restantes === 1 ? 'pessoa' : 'pessoas'}{' '}
                    depois.
                </p>
            )}
        </section>
    )
}
