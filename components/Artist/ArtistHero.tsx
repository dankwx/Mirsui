// A abertura da página de artista: foto, nome, contexto, ação e números.
//
// A foto é redonda porque artista é gente (ou um coletivo): o guia reserva o
// círculo para avatares e o quadrado de quinas pequenas para objetos musicais.
// É o mesmo desenho dos "Artistas do acervo" no perfil, e distingue de cara
// esta abertura da abertura da faixa, onde a capa é o objeto.
//
// Não há "Seguir": essa função não existe no produto. A ação dominante é ouvir
// onde a música está, em link de texto com a seta de acesso.

import { ArrowUpRight } from 'lucide-react'
import FotoDePerfil from '@/components/FotoDePerfil'
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
import type { ArtistaDaVitrine } from '@/utils/artistPageService'
import { fotoMenor, pessoas, plural } from './format'
import styles from './ArtistHero.module.css'

interface ArtistHeroProps {
    artista: ArtistaDaVitrine
    lancamentos: number
    faixasMedidas: number
}

export default function ArtistHero({
    artista,
    lancamentos,
    faixasMedidas,
}: ArtistHeroProps) {
    const total = artista.followers.total
    const fas = total > 0 ? pessoas(total) : null
    const fa = total === 1 ? 'fã' : 'fãs'
    const foto = fotoMenor(artista.images[0]?.url ?? null)
    const inicial = artista.name.trim().slice(0, 1).toUpperCase() || '·'

    return (
        <header className={styles.hero}>
            <div className={`${shellStyles.container} ${styles.layout}`}>
                <div className={styles.photo}>
                    <FotoDePerfil
                        src={foto}
                        loading="eager"
                        className={styles.photoImage}
                    >
                        <span
                            className={styles.photoFallback}
                            role="img"
                            aria-label={`Sem foto de ${artista.name}`}
                        >
                            {inicial}
                        </span>
                    </FotoDePerfil>
                </div>

                <div className={styles.copy}>
                    <p className={styles.eyebrow}>
                        <span>Artista</span>
                        {fas && <span>{fas} {fa} no Deezer</span>}
                        {lancamentos > 0 && (
                            <span>{plural(lancamentos, 'lançamento', 'lançamentos')}</span>
                        )}
                    </p>

                    <h1 className={styles.name}>{artista.name}</h1>

                    <div className={styles.actions}>
                        <a
                            href={artista.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={recipes.textLink}
                        >
                            Ouvir no Deezer
                            <ArrowUpRight size={17} aria-hidden="true" />
                        </a>
                    </div>
                </div>

                <dl className={styles.stats}>
                    {fas && (
                        <div className={recipes.stat}>
                            <dt className={recipes.statLabel}>{fa} no Deezer</dt>
                            <dd className={recipes.statValue}>{fas}</dd>
                        </div>
                    )}
                    {faixasMedidas > 0 && (
                        <div className={`${recipes.stat} ${recipes.statAccent}`}>
                            <dt className={recipes.statLabel}>
                                audiência média das mais ouvidas,
                                <br />
                                de 0 a 100
                            </dt>
                            <dd className={recipes.statValue}>
                                {artista.popularity}
                            </dd>
                        </div>
                    )}
                    <div className={recipes.stat}>
                        <dt className={recipes.statLabel}>
                            {lancamentos === 1 ? 'lançamento' : 'lançamentos'}
                        </dt>
                        <dd className={recipes.statValue}>
                            {lancamentos.toLocaleString('pt-BR')}
                        </dd>
                    </div>
                </dl>
            </div>
        </header>
    )
}
