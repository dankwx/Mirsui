'use client'

// A ficha da peça, ao clicar numa capa: um diálogo em papel, no mesmo padrão
// do perfil (Radix Dialog com as classes de papel). O Radix cuida do Escape,
// do foco preso, da trava de scroll do body e de devolver o foco à peça.
//
// Um número só, e ele é medido. Antes eram dois — "no acervo" e "a primeira"
// —, os dois saídos de um hash do nome da faixa. Ver migrations/013_pilha_real.sql.

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog'
import RecordCover from '@/components/Club/RecordCover'
import recipes from '@/components/Club/club-recipes.module.css'
import { HEAT_LABEL, type PileTrack } from '@/utils/pileTypes'
import { enderecoDaFaixa } from '@/utils/trackHref'
import styles from './PieceSheet.module.css'

function spotifySearch(t: PileTrack) {
    return `https://open.spotify.com/search/${encodeURIComponent(`${t.artist} ${t.title}`)}`
}

export default function PieceSheet({
    track,
    onClose,
}: {
    track: PileTrack | null
    onClose: () => void
}) {
    // A última faixa aberta continua renderizada enquanto o diálogo fecha:
    // se o conteúdo sumisse no mesmo render em que `open` vira false, o Radix
    // não chegava a devolver o foco à peça que abriu a ficha.
    const ultima = useRef<PileTrack | null>(null)
    if (track) ultima.current = track
    const mostrada = track ?? ultima.current

    // Sem DialogTrigger, o Radix não sabe para onde devolver o foco ao fechar
    // (ele tentaria o trigger e cairia no body). Guarda-se a peça que abriu a
    // ficha no momento em que o foco entra no diálogo — aí ainda é ela o
    // activeElement — e devolve-se a ela no fechamento.
    const origem = useRef<HTMLElement | null>(null)

    return (
        <Dialog open={track !== null} onOpenChange={(aberto) => !aberto && onClose()}>
            {mostrada && (
                <DialogContent
                    className={styles.content}
                    overlayClassName={styles.overlay}
                    closeClassName={styles.close}
                    onOpenAutoFocus={() => {
                        origem.current = document.activeElement as HTMLElement | null
                    }}
                    onCloseAutoFocus={(e) => {
                        e.preventDefault()
                        origem.current?.focus()
                    }}
                >
                    {/* 500 px: a ficha é a única peça grande de verdade. */}
                    <RecordCover
                        src={mostrada.cover}
                        alt={`Capa de ${mostrada.title}`}
                        className={styles.cover}
                        priority
                    />

                    <div className={styles.body}>
                        <DialogTitle className={styles.title}>
                            {mostrada.title}
                        </DialogTitle>
                        <DialogDescription className={styles.artist}>
                            {mostrada.artist}
                        </DialogDescription>
                        <p className={styles.context}>
                            {mostrada.genre} · {HEAT_LABEL[mostrada.heat]}
                        </p>

                        <dl className={styles.facts}>
                            <div>
                                {/* Audiência é contagem de gente, não
                                    precedência: não leva o laranja. */}
                                <dt>Audiência hoje</dt>
                                <dd className={recipes.smallNumber}>
                                    {mostrada.audiencia}
                                    <span>/100</span>
                                </dd>
                            </div>
                        </dl>

                        {/* Ia para /claimtrack, genérico: a página não sabia de
                            que faixa se tratava, e para visitante deslogado era
                            só uma parede de login. Agora abre a ficha da própria
                            faixa, que é pública e tem o botão de salvar de
                            verdade — quando o ISRC já chegou. */}
                        <div className={styles.actions}>
                            {mostrada.isrc ? (
                                <Link
                                    href={enderecoDaFaixa(
                                        mostrada.isrc,
                                        mostrada.artist,
                                        mostrada.title
                                    )}
                                    className={recipes.button}
                                >
                                    Abrir a faixa
                                </Link>
                            ) : (
                                <p className={styles.noAddress}>
                                    Ainda sem endereço no Mirsui.
                                </p>
                            )}
                            <a
                                href={spotifySearch(mostrada)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={recipes.textLink}
                            >
                                Ouvir no Spotify
                                <ArrowUpRight size={16} aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    )
}
