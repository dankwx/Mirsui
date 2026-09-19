'use client'

// As ações da faixa: salvar no acervo (com nota opcional), ouvir fora daqui e
// compartilhar o endereço.
//
// Três decisões:
//
// 1. Quem não está logado vê o mesmo botão, mas ele abre o cadastro. Antes o
//    clique batia na API, voltava 401 e virava um toast pedindo login — o
//    botão parecia quebrado. Agora a página sabe quem está olhando e o botão
//    faz a coisa certa de primeira.
// 2. O retorno é inline, não em toast: o botão muda de estado, a linha de
//    precedência muda de texto e o erro aparece ao lado do que falhou. O
//    toast do tema antigo não pertence a esta identidade, e a página já tem o
//    lugar certo para cada informação.
// 3. Depois de salvar, `router.refresh()`: o registro e a lista de quem
//    salvou são renderizados no servidor e passam a incluir a pessoa sem que
//    ela precise recarregar. O estado local dá a resposta imediata; o refresh
//    dá a verdade.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowUpRight,
    Check,
    Link2,
    Loader2,
    MessageSquareText,
    Plus,
} from 'lucide-react'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import SpotifyListenButton from '@/components/SpotifyListenButton/SpotifyListenButton'
import recipes from '@/components/Club/club-recipes.module.css'
import { capture } from '@/lib/posthog'
import styles from './TrackActions.module.css'

interface TrackActionsProps {
    /** chave opaca do acervo: `spotify:track:<id>` (legado) ou `isrc:<ISRC>` */
    trackUri: string
    /**
     * A identidade da GRAVAÇÃO. Vai junto no save para que a mesma faixa salva
     * por caminhos diferentes conte no mesmo lugar — ver `tracks.isrc` na
     * migration 023 e utils/trackClaims.ts.
     */
    isrc: string | null
    spotifyTrackId: string | null
    trackTitle: string
    artistName: string
    albumName: string
    popularity: number
    trackThumbnail: string
    /** onde ouvir a faixa fora daqui (Spotify ou Deezer) */
    trackUrl: string
    /** o endereço canônico da faixa NO MIRSUI — é isto que se compartilha */
    shareUrl: string
    totalClaims: number
    isLoggedIn: boolean
    initialClaimed?: boolean
    userPosition?: number | null
}

export default function TrackActions({
    trackUri,
    isrc,
    spotifyTrackId,
    trackTitle,
    artistName,
    albumName,
    popularity,
    trackThumbnail,
    trackUrl,
    shareUrl,
    totalClaims,
    isLoggedIn,
    initialClaimed = false,
    userPosition = null,
}: TrackActionsProps) {
    const router = useRouter()
    const [salvando, setSalvando] = useState(false)
    const [salva, setSalva] = useState(initialClaimed)
    const [posicao, setPosicao] = useState(userPosition)
    const [total, setTotal] = useState(totalClaims)
    const [comNota, setComNota] = useState(false)
    const [nota, setNota] = useState('')
    const [erro, setErro] = useState<string | null>(null)
    const [copiado, setCopiado] = useState(false)

    const salvar = async () => {
        if (salva || salvando) return
        setSalvando(true)
        setErro(null)
        try {
            const response = await fetch('/api/claim-track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackUri,
                    isrc,
                    trackName: trackTitle,
                    artistName,
                    albumName,
                    spotifyUrl: trackUrl,
                    trackThumbnail,
                    popularity,
                    claimMessage: nota.trim() || undefined,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 401) {
                    setErro('Sua sessão expirou. Entre de novo para salvar.')
                    return
                }
                if (response.status === 409) {
                    setSalva(true)
                    setPosicao(data.position)
                    setComNota(false)
                    return
                }
                throw new Error(data.error || 'Não deu para salvar a faixa.')
            }

            capture('track_claimed', {
                track_uri: trackUri,
                track_title: trackTitle,
                artist_name: artistName,
                position: data.position,
                with_message: nota.trim().length > 0,
                popularity,
            })
            setSalva(true)
            setPosicao(data.position)
            setTotal((t) => t + 1)
            setComNota(false)
            setNota('')
            router.refresh()
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : 'Não deu para salvar a faixa. Tente de novo.'
            )
        } finally {
            setSalvando(false)
        }
    }

    const compartilhar = async () => {
        // O link é o da página no Mirsui, não o do Spotify. Compartilhar a
        // faixa daqui mandava o tráfego para fora da própria página que o
        // gerou — e o link de lá não tem quem salvou nem a curva.
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${trackTitle} — ${artistName}`,
                    text: 'Confira esta faixa no Mirsui',
                    url: shareUrl,
                })
                capture('track_shared', {
                    track_uri: trackUri,
                    method: 'native',
                })
            } else {
                await navigator.clipboard.writeText(shareUrl)
                capture('track_shared', {
                    track_uri: trackUri,
                    method: 'clipboard',
                })
                setCopiado(true)
                setTimeout(() => setCopiado(false), 2000)
            }
        } catch {
            /* usuário cancelou o compartilhamento */
        }
    }

    const proximo = total + 1

    return (
        <div className={styles.actions}>
            <div className={styles.row}>
                {!isLoggedIn ? (
                    <AuthModalTrigger
                        mode="signup"
                        className={`${recipes.button} ${styles.primary}`}
                    >
                        <Plus size={17} aria-hidden="true" />
                        Salvar no acervo
                    </AuthModalTrigger>
                ) : salva ? (
                    <span
                        className={`${styles.saved} ${styles.primary}`}
                        aria-live="polite"
                    >
                        <Check size={16} aria-hidden="true" />
                        No seu acervo
                        {posicao ? (
                            <span className={styles.savedPosition}>
                                {posicao}º
                            </span>
                        ) : null}
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={salvar}
                        disabled={salvando}
                        className={`${recipes.button} ${styles.primary}`}
                    >
                        {salvando ? (
                            <Loader2
                                size={17}
                                className={styles.spin}
                                aria-hidden="true"
                            />
                        ) : (
                            <Plus size={17} aria-hidden="true" />
                        )}
                        Salvar no acervo
                    </button>
                )}

                {isLoggedIn && !salva && (
                    <button
                        type="button"
                        onClick={() => setComNota((v) => !v)}
                        aria-expanded={comNota}
                        aria-controls="track-note"
                        className={recipes.textLink}
                    >
                        <MessageSquareText size={15} aria-hidden="true" />
                        {comNota ? 'Sem nota' : 'Salvar com uma nota'}
                    </button>
                )}

                <SpotifyListenButton
                    spotifyTrackId={spotifyTrackId}
                    isrc={isrc}
                    trackTitle={trackTitle}
                    artistName={artistName}
                    className={recipes.textLink}
                >
                    Ouvir no Spotify
                    <ArrowUpRight size={15} aria-hidden="true" />
                </SpotifyListenButton>

                <button
                    type="button"
                    onClick={compartilhar}
                    className={recipes.textLink}
                    aria-live="polite"
                >
                    {copiado ? (
                        <>
                            <Check size={15} aria-hidden="true" />
                            Link copiado
                        </>
                    ) : (
                        <>
                            <Link2 size={15} aria-hidden="true" />
                            Compartilhar
                        </>
                    )}
                </button>
            </div>

            {comNota && !salva && (
                <div id="track-note" className={styles.note}>
                    <label htmlFor="track-note-text">
                        Por que esta faixa importa para você?
                    </label>
                    <textarea
                        id="track-note-text"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        maxLength={280}
                        rows={3}
                        autoFocus
                        placeholder="A nota fica no seu registro e aparece no feed."
                    />
                    <div className={styles.noteFooter}>
                        <span className={recipes.smallNumber}>
                            {nota.length}/280
                        </span>
                        <button
                            type="button"
                            onClick={salvar}
                            disabled={salvando}
                            className={`${recipes.button} ${recipes.buttonSmall}`}
                        >
                            {salvando ? 'Salvando…' : 'Salvar com a nota'}
                        </button>
                    </div>
                </div>
            )}

            {erro && (
                <p className={styles.error} role="alert">
                    {erro}
                </p>
            )}

            <p className={styles.precedence} aria-live="polite">
                {salva ? (
                    <>
                        Você chegou em{' '}
                        <strong>{posicao ? `${posicao}º` : `${total}º`}</strong>
                        .
                        {total > 1
                            ? ` ${total} pessoas guardam esta faixa.`
                            : ' Esta faixa é só sua, por enquanto.'}
                    </>
                ) : total === 0 ? (
                    <>
                        <strong>Ninguém salvou ainda.</strong> O primeiro
                        registro pode ser o seu.
                    </>
                ) : (
                    <>
                        <strong>{total}</strong>
                        {total === 1
                            ? ' pessoa já salvou'
                            : ' pessoas já salvaram'}
                        {' · '}
                        seja a <strong>{proximo}ª</strong> antes de virar
                        mainstream
                    </>
                )}
            </p>
        </div>
    )
}
