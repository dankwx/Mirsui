// O que é do Mirsui na página de artista: quem já guardou faixas dele.
//
// Dado real, de uma consulta à tabela `tracks` (utils/artistClaims.ts). Quando
// a consulta falha a seção não aparece; quando ninguém salvou nada, a frase
// diz isso. Substitui as listas de "seguidores recentes" e "maiores fãs" com
// nomes fictícios que ficavam aqui.

import Link from 'next/link'
import FotoDePerfil from '@/components/FotoDePerfil'
import recipes from '@/components/Club/club-recipes.module.css'
import type { PrecedenciaDoArtista } from '@/utils/artistClaims'
import { dataCompleta, iniciais, nomeDe, perfilDe } from './format'
import styles from './QuemGarimpou.module.css'

export default function QuemGarimpou({
    precedencia,
    nomeDoArtista,
}: {
    precedencia: PrecedenciaDoArtista
    nomeDoArtista: string
}) {
    const { primeiros, total, pessoas } = precedencia
    const faixasSalvas = Object.keys(precedencia.porFaixa).length

    return (
        <section className={styles.section} aria-labelledby="quem-garimpou-title">
            <div className={styles.heading}>
                <h2 id="quem-garimpou-title">Quem já garimpou</h2>
                <p>
                    {total === 0
                        ? `Ninguém guardou uma faixa de ${nomeDoArtista} no acervo ainda.`
                        : pessoas === 1
                          ? `Uma pessoa guarda ${faixasSalvas === 1 ? 'uma faixa' : `${faixasSalvas} faixas`} de ${nomeDoArtista} no acervo.`
                          : `${pessoas} pessoas guardam ${faixasSalvas === 1 ? 'uma faixa' : `${faixasSalvas} faixas`} de ${nomeDoArtista} no acervo.`}
                </p>
            </div>

            {primeiros.length === 0 ? (
                <p className={styles.empty}>
                    O primeiro registro fica marcado para sempre. Abra uma das
                    mais ouvidas e salve.
                </p>
            ) : (
                <ol className={styles.list}>
                    {primeiros.map((s) => {
                        const perfil = perfilDe(s.profiles)
                        const nome = nomeDe(perfil)
                        const primeiro = s.position === 1
                        const href = perfil?.username
                            ? `/user/${perfil.username}`
                            : null

                        return (
                            <li
                                key={s.user_id}
                                className={`${styles.row} ${primeiro ? styles.first : ''}`}
                            >
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
                                        {primeiro ? 'chegou primeiro em ' : 'salvou '}
                                        {s.faixa.href ? (
                                            <Link href={s.faixa.href}>
                                                {s.faixa.name}
                                            </Link>
                                        ) : (
                                            s.faixa.name
                                        )}
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
        </section>
    )
}
