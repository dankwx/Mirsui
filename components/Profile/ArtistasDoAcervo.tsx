import RecordCover from '@/components/Club/RecordCover'
import recipes from '@/components/Club/club-recipes.module.css'
import type { TopArtist } from '@/utils/profileStats'
import styles from './ArtistasDoAcervo.module.css'

// A imagem de cada artista é a capa de uma faixa dele no acervo, não uma foto:
// por isso é quadrada, como capa, e não redonda, como gente.
export default function ArtistasDoAcervo({ artists }: { artists: TopArtist[] }) {
    if (artists.length < 3) return null

    return (
        <section className={styles.section} aria-labelledby="artistas-do-acervo">
            <h2 id="artistas-do-acervo">Artistas</h2>
            <p className={styles.description}>Quem mais aparece no acervo.</p>

            {/* Não há id de artista neste dado. A lista é um retrato do
                acervo, não uma navegação disfarçada. */}
            <ol className={styles.list}>
                {artists.map((artist) => (
                    <li key={artist.name} className={styles.row}>
                        <RecordCover
                            src={artist.thumbnail}
                            alt=""
                            className={`${recipes.sleeve} ${styles.cover}`}
                        />
                        <div className={styles.copy}>
                            <div className={styles.name} title={artist.name}>
                                {artist.name}
                            </div>
                            <div className={styles.count}>
                                {artist.count} {artist.count === 1 ? 'faixa' : 'faixas'}
                                {artist.bestPosition !== null && (
                                    <>
                                        {' · '}
                                        <span
                                            className={
                                                artist.bestPosition === 1
                                                    ? styles.best
                                                    : undefined
                                            }
                                        >
                                            {artist.bestPosition === 1
                                                ? 'chegou em primeiro'
                                                : `melhor colocação: ${artist.bestPosition}ª`}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    )
}
