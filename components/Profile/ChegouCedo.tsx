// "Chegou cedo": as faixas em que a pessoa chegou antes de quase todo mundo.
//
// A primeira vira um registro (papel, divisão pontilhada, posição grande), o
// mesmo objeto da página de faixa e da home. As outras entram numa lista
// curta com a posição na frente, porque é a posição que esta seção prova.

import Link from 'next/link'
import { Disc3 } from 'lucide-react'
import RecordCover from '@/components/Club/RecordCover'
import SeloDeChegada from '@/components/MirsuiLogo/SeloDeChegada'
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
import { dataCompleta } from '@/components/Track/format'
import { trackHref } from './trackHref'
import type { Song } from '@/types/profile'
import styles from './ChegouCedo.module.css'

const MESES = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
]

const mesAno = (iso: string | null) => {
    if (!iso) return null
    const d = new Date(iso)
    if (isNaN(d.getTime())) return null
    return `${MESES[d.getMonth()]} ${d.getFullYear()}`
}

// O próprio dono é o primeiro salvador. Quando ninguém veio depois, a data
// ainda informa desde quando aquele registro existe.
const depoisDe = (song: Song, savers?: number) =>
    savers && savers > 1 ? `${savers} já salvaram` : mesAno(song.claimedat)

const ordinal = (position: number | null) => (position !== null ? `${position}ª` : '·')

export default function ChegouCedo({
    songs,
    savers,
}: {
    songs: Song[]
    savers: Record<string, number>
}) {
    if (songs.length === 0) return null

    const [destaque, ...resto] = songs
    const saversDe = (song: Song) => (song.track_uri ? savers[song.track_uri] : undefined)
    const depoisDoDestaque = depoisDe(destaque, saversDe(destaque))

    return (
        <section className={styles.section} aria-labelledby="chegou-cedo">
            <div className={`${shellStyles.container} ${styles.container}`}>
                <div className={styles.heading}>
                    <h2 id="chegou-cedo">Chegou cedo</h2>
                    <p>As faixas em que chegou mais cedo.</p>
                </div>

                <div className={`${styles.content} ${resto.length === 0 ? styles.single : ''}`}>
                    <Link href={trackHref(destaque)} className={styles.receipt}>
                        <span className={styles.receiptHeader}>
                            <Disc3 size={19} aria-hidden="true" />
                            <span>REGISTRO DE DESCOBERTA</span>
                            <span aria-hidden="true">m.</span>
                        </span>

                        <RecordCover
                            src={destaque.track_thumbnail}
                            alt=""
                            className={`${recipes.sleeve} ${styles.receiptCover}`}
                        />

                        <span className={styles.receiptTrack}>
                            <span className={styles.receiptTitle}>{destaque.track_title}</span>
                            <span className={styles.receiptArtist}>{destaque.artist_name}</span>
                        </span>

                        <span className={styles.receiptResult}>
                            <span className={styles.receiptPosition}>
                                {ordinal(destaque.position)}
                            </span>
                            <span>
                                <strong>a salvar</strong>
                                {depoisDoDestaque && <small>{depoisDoDestaque}</small>}
                            </span>
                            <SeloDeChegada
                                posicao={destaque.position}
                                data={destaque.claimedat}
                                size={104}
                                rotulo={`Salva em ${dataCompleta(destaque.claimedat)}`}
                                className={styles.selo}
                            />
                        </span>
                    </Link>

                    {resto.length > 0 && (
                        <ol className={styles.list}>
                            {resto.map((song) => {
                                const depois = depoisDe(song, saversDe(song))
                                return (
                                    <li key={song.id}>
                                        <Link href={trackHref(song)} className={styles.row}>
                                            <span
                                                className={`${styles.position} ${song.position === 1 ? styles.positionAccent : ''}`}
                                            >
                                                {ordinal(song.position)}
                                                {song.position !== null && (
                                                    <span className="sr-only"> a salvar, </span>
                                                )}
                                            </span>
                                            <RecordCover
                                                src={song.track_thumbnail}
                                                alt=""
                                                className={`${recipes.sleeve} ${styles.rowCover}`}
                                            />
                                            <span className={styles.rowCopy}>
                                                <span className={styles.rowTitle}>
                                                    {song.track_title}
                                                </span>
                                                <span className={styles.rowArtist}>
                                                    {song.artist_name}
                                                </span>
                                            </span>
                                            {depois && (
                                                <span className={styles.rowMeta}>{depois}</span>
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ol>
                    )}
                </div>
            </div>
        </section>
    )
}
