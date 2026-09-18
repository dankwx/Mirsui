import Link from 'next/link'
import RecordCover from '@/components/Club/RecordCover'
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
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

function Chamada({
    song,
    savers,
    big = false,
}: {
    song: Song
    savers?: number
    big?: boolean
}) {
    // O próprio dono é o primeiro salvador. Quando ninguém veio depois, a
    // data ainda informa desde quando aquele registro existe.
    const depois = savers && savers > 1 ? `${savers} já salvaram` : mesAno(song.claimedat)
    const n = song.position

    return (
        <div className={big ? styles.calloutLarge : styles.callout}>
            {n !== null && (
                <>
                    <span
                        className={`${recipes.smallNumber} ${styles.ordinal} ${n === 1 ? styles.ordinalAccent : ''}`}
                    >
                        {n}ª
                    </span>
                    <span>a salvar</span>
                </>
            )}
            {n !== null && depois && <span> · </span>}
            {depois && <span>{depois}</span>}
        </div>
    )
}

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

    return (
        <section className={styles.section}>
            <div className={`${shellStyles.container} ${styles.container}`}>
                <div className={styles.heading}>
                    <h2>Chegou cedo</h2>
                    <p>As faixas em que chegou mais cedo.</p>
                </div>

                <div className={styles.content}>
                    <Link href={trackHref(destaque)} className={styles.featuredLink}>
                        <RecordCover
                            src={destaque.track_thumbnail}
                            alt={`Capa de ${destaque.track_title}`}
                            className={`${recipes.sleeve} ${styles.featuredCover}`}
                        />
                        <h3>{destaque.track_title}</h3>
                        <p className={styles.artist}>{destaque.artist_name}</p>
                        <div className={styles.receiptResult}>
                            <span className={styles.featuredOrdinal}>
                                {destaque.position}ª
                            </span>
                            <div>
                                <strong>a salvar</strong>
                                <p>
                                    {saversDe(destaque) && saversDe(destaque)! > 1
                                        ? `${saversDe(destaque)} já salvaram`
                                        : mesAno(destaque.claimedat)}
                                </p>
                            </div>
                        </div>
                    </Link>

                    {resto.length > 0 && (
                        <div className={styles.secondaryGrid}>
                            {resto.map((song) => (
                                <Link
                                    key={song.id}
                                    href={trackHref(song)}
                                    className={styles.secondaryLink}
                                >
                                    <RecordCover
                                        src={song.track_thumbnail}
                                        alt={`Capa de ${song.track_title}`}
                                    />
                                    <h3>{song.track_title}</h3>
                                    <p className={styles.artist}>{song.artist_name}</p>
                                    <Chamada
                                        song={song}
                                        savers={saversDe(song)}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
