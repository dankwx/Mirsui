import FotoDePerfil from '@/components/FotoDePerfil'
import shellStyles from '@/components/Club/ClubShell.module.css'
import type { TopArtist } from '@/utils/profileStats'
import styles from './ArtistasDoAcervo.module.css'

export default function ArtistasDoAcervo({ artists }: { artists: TopArtist[] }) {
    if (artists.length < 3) return null

    return (
        <section className={styles.section}>
            <div className={`${shellStyles.container} ${styles.container}`}>
                <h2>Artistas</h2>
                <p className={styles.description}>Quem mais aparece no acervo.</p>

                {/* Não há id de artista neste dado. A lista é um retrato do
                    acervo, não uma navegação disfarçada. */}
                <ul className={styles.list}>
                    {artists.map((artist) => (
                        <li key={artist.name} className={styles.artist}>
                            <div className={styles.avatar}>
                                <FotoDePerfil
                                    src={artist.thumbnail}
                                    className={styles.avatarImage}
                                >
                                    <span>{artist.name.slice(0, 1)}</span>
                                </FotoDePerfil>
                            </div>
                            <div className={styles.name} title={artist.name}>
                                {artist.name}
                            </div>
                            <div className={styles.count}>
                                {artist.count}{' '}
                                {artist.count === 1 ? 'faixa' : 'faixas'}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
