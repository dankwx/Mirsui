// Parecidas: uma faixa de cada artista que anda perto deste.
//
// A vizinhança vem pronta do banco, na mesma RPC da página (migration 041):
// a rodada soma o que a descoberta já perguntou ao Deezer — rádio e artistas
// relacionados — e quem gravou junto. A visita não chama ninguém.
//
// O desenho é o grid de capas 1:1 com título e artista abaixo, o mesmo da
// discografia e do Acervo da home. A capa e o título levam à faixa; o nome,
// à página do artista. Sem vizinhos, a seção não aparece.

import Link from 'next/link'
import RecordCover from '@/components/Club/RecordCover'
import shellStyles from '@/components/Club/ClubShell.module.css'
import { enderecoDoArtista } from '@/utils/artistHref'
import type { FaixaRelacionada } from '@/utils/trackPageService'
import styles from './Parecidas.module.css'

export default function Parecidas({
    faixas,
    artista,
}: {
    faixas: FaixaRelacionada[]
    /** o artista principal desta faixa, para o texto de apoio */
    artista: string | null
}) {
    if (faixas.length === 0) return null

    return (
        <section className={styles.section} aria-labelledby="parecidas-title">
            <div className={`${shellStyles.container} ${styles.inner}`}>
                <div className={styles.heading}>
                    <h2 id="parecidas-title">Parecidas</h2>
                    <p>
                        {artista
                            ? `Uma faixa de cada artista que anda perto de ${artista}.`
                            : 'Uma faixa de cada artista que anda perto deste.'}
                    </p>
                </div>

                <ul className={styles.grid}>
                    {faixas.map((f) => (
                        <li key={f.isrc} className={styles.item}>
                            <Link href={f.href} className={styles.link}>
                                <RecordCover
                                    src={f.coverUrl}
                                    alt=""
                                    className={styles.cover}
                                />
                                <span className={styles.name} title={f.title}>
                                    {f.title}
                                </span>
                            </Link>
                            {f.artistId ? (
                                <Link
                                    href={enderecoDoArtista(
                                        f.artistId,
                                        f.artistName
                                    )}
                                    className={styles.artist}
                                    title={f.artistName}
                                >
                                    {f.artistName}
                                </Link>
                            ) : (
                                <span
                                    className={styles.artist}
                                    title={f.artistName}
                                >
                                    {f.artistName}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
