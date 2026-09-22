// app/(club)/track/[id]/page.tsx
//
// A página de faixa, endereçada pelo ISRC.
//
// O QUE MUDOU E POR QUÊ
// Esta página era derivada inteira de uma linha — `fetchSpotifyTrackInfo(id)` —
// e quando o Spotify devolvia null não existia plano B: sumia capa, artista,
// ficha técnica, prévia e até a curva do Observatório, que é dado nosso e não
// depende de API nenhuma para existir. Em 15/08/2026 a credencial estava em 429
// com Retry-After de 3h24, e 4 de 4 páginas de produção renderizavam
// "Faixa Desconhecida" com <title> vazio — inclusive para crawler.
//
// Além de cair, ela só existia para 1.388 das 6.490 faixas que o Observatório
// mede: o endereço era o id do Spotify, e 5.102 gravações medidas todo dia
// simplesmente não tinham um. O funil nunca foi do catálogo nem do Deezer.
//
// Agora o endereço é o ISRC — o código da gravação, que não é de plataforma
// nenhuma — e a fonte é o Deezer, que numa requisição sem chave devolve tudo
// que esta página lê, mais o gênero (que o Spotify deixa vazio para BR/indie) e
// a prévia de 30 s (que o Spotify cortou). Ver
// docs/plano-independencia-do-spotify.md.
//
// URLs antigas não quebram: id do Spotify e id do Deezer são redirecionados
// para a forma canônica (§4.2 — os três formatos não colidem, verificado contra
// os 3.425 ISRCs do banco).
//
// A PÁGINA NA IDENTIDADE CLUB (18/09/2026)
// Vive no grupo `(club)`, com o shell, o header e o rodapé compactos de
// DESIGN.md. A composição segue a linha "Faixa / artista" do guia: capa e
// ação dominam a abertura; a precedência aparece no registro e na lista de
// quem chegou antes; o Observatório fecha. Os dados e as rotas não mudaram.

import { permanentRedirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { fetchAuthData } from '@/utils/profileService'
import { searchYouTubeVideo } from '@/utils/youtubeService'
import {
    formatoDoId,
    isrcDoEndereco,
    isrcDeIdSpotify,
    isrcDeIdDeezer,
} from '@/utils/trackIdentity'
import { enderecoDaFaixa } from '@/utils/trackHref'
import { enderecoDoArtista } from '@/utils/artistHref'
import {
    carregarFaixaPorIsrc,
    carregarFaixaLegada,
    carregarDadosDaFaixa,
    type DadosDaFaixa,
} from '@/utils/trackPageService'
import {
    contarSalvamentos,
    quemSalvou,
    salvamentoDoUsuario,
} from '@/utils/trackClaims'
import type { Metadata } from 'next'
import Link from 'next/link'
import RecordCover from '@/components/Club/RecordCover'
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
import TrackPlayer from '@/components/Track/TrackPlayer'
import TrackActions from '@/components/Track/TrackActions'
import TrackReceipt, {
    type RegistroDoRecibo,
} from '@/components/Track/TrackReceipt'
import QuemSalvou from '@/components/Track/QuemSalvou'
import TrackCurve from '@/components/Track/TrackCurve'
import {
    dataDeLancamento,
    duracao,
    generos,
    nomeDe,
    perfilDe,
} from '@/components/Track/format'
import styles from '@/components/Track/TrackPage.module.css'

/* ------------------------------------------------------------- resolução */

interface Resolvida {
    faixa: DadosDaFaixa
    /** null no caminho legado, onde não há gravação identificada */
    isrc: string | null
}

/**
 * O endereço canônico de um ISRC.
 *
 * Existe para que as URLs de plataforma cheguem à forma final em UM salto. O
 * caminho preguiçoso seria mandá-las para `/track/<isrc>` e deixar o próximo
 * request acrescentar o slug, mas aí toda URL antiga custaria dois
 * redirecionamentos — e cadeia de redirecionamento é exatamente o que faz o
 * rastreador desistir.
 *
 * Quem monta o endereço é `carregarFaixaPorIsrc`, não esta função: a regra de
 * qual título vira slug depende de ver as duas fontes ao mesmo tempo, e lá é o
 * único lugar onde as duas existem.
 */
async function canonicoDe(isrc: string): Promise<string> {
    const chave = isrc.toUpperCase()
    const faixa = await carregarFaixaPorIsrc(chave)
    return faixa?.enderecoCanonico ?? enderecoDaFaixa(chave)
}

/**
 * Do que veio na URL até a ficha da faixa.
 *
 * Redireciona (308) quando o id é de plataforma e dá para descobrir o ISRC —
 * assim cada URL antiga paga a conversão uma vez e nunca mais. `permanentRedirect`
 * lança, então quem chama não continua depois dele.
 */
async function resolver(bruto: string): Promise<Resolvida | null> {
    const id = decodeURIComponent(bruto || '').trim()
    const formato = formatoDoId(id)

    // ISRC puro e `slug-isrc` são o mesmo caso: os dois carregam o ISRC no fim
    // e o que muda é só a decoração na frente.
    if (formato === 'isrc' || formato === 'slug') {
        const isrc = isrcDoEndereco(id)
        if (!isrc) return null

        const faixa = await carregarFaixaPorIsrc(isrc)
        if (!faixa) return null

        // A forma canônica só pode ser conhecida DEPOIS de carregar a faixa,
        // porque o slug vem do título e do artista. Uma comparação resolve
        // todos os desvios de uma vez: caixa alta (/track/USUM72409273), slug
        // ausente, slug antigo de um título que mudou desde então, e slug
        // simplesmente errado que alguém digitou. Todos chegam na URL certa por
        // 308, nenhum vira 404.
        const canonico = faixa.enderecoCanonico ?? enderecoDaFaixa(isrc)
        if (`/track/${id}` !== canonico) permanentRedirect(canonico)

        return { faixa, isrc }
    }

    if (formato === 'deezer') {
        const isrc = await isrcDeIdDeezer(id)
        if (isrc) permanentRedirect(await canonicoDe(isrc))
        return null
    }

    if (formato === 'spotify') {
        const isrc = await isrcDeIdSpotify(id)
        if (isrc) permanentRedirect(await canonicoDe(isrc))
        // Não deu para converter: renderiza pelo que o acervo guardou, sem
        // chamar ninguém. Antes, aqui era onde a página ia a branco.
        const faixa = await carregarFaixaLegada(id)
        return faixa ? { faixa, isrc: null } : null
    }

    return null
}

/* ------------------------------------------------------------- metadados */

export async function generateMetadata({
    params,
}: {
    params: { id: string }
}): Promise<Metadata> {
    const r = await resolver(params.id).catch(() => null)

    if (!r) {
        return {
            title: 'Faixa - Mirsui',
            description: 'Descubra informações sobre esta faixa no Mirsui.',
        }
    }

    const { title, artistNames } = r.faixa
    return {
        title: `${title} - ${artistNames} | Mirsui`,
        description: `Descubra quem salvou "${title}" de ${artistNames} antes de virar mainstream. Salve seu achado no Mirsui.`,
        // Uma gravação, um endereço. Sem isto, o ISRC puro, a forma com slug e
        // as URLs antigas de plataforma seriam três páginas aos olhos do
        // índice, dividindo entre si o pouco sinal que existe.
        alternates: { canonical: r.faixa.enderecoCanonico ?? undefined },
    }
}

/* -------------------------------------------------------------- página */

export default async function TrackDetailsPage({
    params,
}: {
    params: { id: string }
}) {
    const resolvida = await resolver(params.id)
    if (!resolvida) notFound()

    const { faixa, isrc } = resolvida

    const authData = await fetchAuthData()
    const isLoggedIn = authData?.user ? true : false
    const viewerId = authData?.user?.id ?? null

    /**
     * A chave opaca do acervo. `tracks.track_uri` continua sendo
     * `spotify:track:<id>` para tudo que já foi salvo — migrar isso seria risco
     * alto no único dado insubstituível do produto (§7 do plano). O que muda é
     * que agora existe `tracks.isrc` ao lado, então a gravação sem id do
     * Spotify também tem chave, e a contagem casa as duas formas.
     */
    const trackUri = faixa.spotifyTrackId
        ? `spotify:track:${faixa.spotifyTrackId}`
        : isrc
          ? `isrc:${isrc}`
          : null

    /**
     * Tudo que é nosso: a curva do Observatório (o histórico de audiência que o
     * Mirsui mede todo dia, casado por ISRC — independe do Deezer estar
     * respondendo agora), a contagem de salvamentos e quem salvou.
     *
     * Vem tudo da MESMA requisição que já montou a ficha técnica lá em cima:
     * `carregarDadosDaFaixa` é `cache()` do React e `carregarFaixaPorIsrc` já a
     * chamou neste mesmo request. Aqui não há ida ao banco nenhuma.
     */
    const dados = isrc ? await carregarDadosDaFaixa(isrc) : null
    const curva = dados?.curva ?? null

    /**
     * O caminho legado não tem ISRC para chavear a RPC e continua nas consultas
     * avulsas. São ~30 renders por dia contra ~19.700 do caminho canônico, e a
     * RPC só existe por causa do volume — ver migration 029.
     */
    const [totalClaims, topClaimers] = dados
        ? [dados.salvamentos, dados.quemSalvou]
        : await Promise.all([
              contarSalvamentos(trackUri, isrc),
              quemSalvou(trackUri, isrc, 8),
          ])

    // Fora da RPC de propósito: é a única coisa da página que depende de quem
    // está olhando, e só roda para quem está logado.
    const meuSalvamento =
        isLoggedIn && viewerId
            ? await salvamentoDoUsuario(viewerId, trackUri, isrc)
            : null

    const hasUserClaimed = !!meuSalvamento
    const userClaimPosition = meuSalvamento?.position ?? null

    const genre = generos(faixa.genres)
    const releaseYear = faixa.releaseDate
        ? new Date(faixa.releaseDate).getFullYear()
        : null

    // Ficha técnica — só o que é medido de verdade. Linha sem valor não aparece.
    const specs = [
        genre && { k: 'Gênero', v: genre },
        faixa.releaseDate && {
            k: 'Lançamento',
            v: dataDeLancamento(faixa.releaseDate),
        },
        faixa.albumName && { k: 'Álbum', v: faixa.albumName },
        faixa.duration > 0 && { k: 'Duração', v: duracao(faixa.duration) },
    ].filter(Boolean) as { k: string; v: string }[]

    // O registro mostra o comprovante de quem olha, quando ela já salvou;
    // senão, o de quem chegou primeiro.
    const primeiro = topClaimers[0]
    const registro: RegistroDoRecibo | null = meuSalvamento
        ? {
              posicao: meuSalvamento.position,
              nome: 'Você',
              data: meuSalvamento.claimedat,
              seu: true,
          }
        : primeiro
          ? {
                posicao: primeiro.position ?? 1,
                nome: nomeDe(perfilDe(primeiro.profiles)),
                data: primeiro.claimedat,
                seu: false,
            }
          : null

    /**
     * Prévia do YouTube: é a SEGUNDA opção, atrás do MP3 do Deezer. Só roda
     * quando se SABE que o Deezer não tem prévia (`temPrevia === false`; null
     * é "ainda não medido", e aí o player do Deezer tenta no play) e quando
     * existe id do Spotify — que é a chave de `youtube_cache` (migrations 002
     * e 017). Na prática isso reduz o consumo da cota do YouTube (100
     * buscas/dia para o site inteiro) a quase zero.
     */
    const previaDoDeezer =
        faixa.temPrevia !== false && faixa.deezerTrackId
            ? `/api/previa/${faixa.deezerTrackId}`
            : null

    let youtubeVideoId: string | null = null
    if (!previaDoDeezer && faixa.spotifyTrackId) {
        const supabase = await createClient()
        const { data: cached } = await supabase
            .from('youtube_cache')
            .select('youtube_video_id')
            .eq('spotify_track_id', faixa.spotifyTrackId)
            .maybeSingle()

        if (cached) {
            youtubeVideoId = cached.youtube_video_id
        } else {
            const youtubeUrl = await searchYouTubeVideo(
                faixa.title,
                faixa.artistNames
            )
            if (youtubeUrl) {
                const match = youtubeUrl.match(
                    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
                )
                youtubeVideoId = match ? match[1] : null
            }
            // Persiste apenas resultados positivos: evita envenenar o cache em
            // falhas transitórias da API (cota estourada também retorna null).
            if (youtubeVideoId) {
                await supabase.rpc('cache_youtube_video', {
                    p_spotify_id: faixa.spotifyTrackId,
                    p_video_id: youtubeVideoId,
                })
            }
        }
    }

    // O link de compartilhar é o NOSSO endereço canônico. Antes era o link do
    // Spotify, o que fazia a página mandar tráfego para fora de si mesma.
    const shareUrl = isrc
        ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mirsui.com'}/track/${isrc}`
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mirsui.com'}/track/${faixa.spotifyTrackId}`

    // A URL guardada em `tracks.track_url` no momento do save: continua sendo
    // "onde ouvir isto fora daqui".
    const linkExterno = faixa.spotifyTrackId
        ? `https://open.spotify.com/track/${faixa.spotifyTrackId}`
        : faixa.deezerTrackId
          ? `https://www.deezer.com/track/${faixa.deezerTrackId}`
          : shareUrl

    return (
        <div>
            {/* ============ ABERTURA ============ */}
            <header className={styles.hero}>
                <div className={`${shellStyles.container} ${styles.heroGrid}`}>
                    <div className={styles.coverColumn}>
                        <RecordCover
                            src={faixa.coverUrl}
                            alt={`Capa de ${faixa.albumName || faixa.title}`}
                            className={`${recipes.sleeve} ${styles.cover}`}
                            priority
                        />
                    </div>

                    <div className={styles.info}>
                        <p className={styles.eyebrow}>
                            <span>Faixa</span>
                            {genre && <span>{genre}</span>}
                            {releaseYear && (
                                <span className={recipes.smallNumber}>
                                    {releaseYear}
                                </span>
                            )}
                            {faixa.explicit && <span>Explícito</span>}
                        </p>

                        <h1 className={styles.title}>{faixa.title}</h1>

                        <p className={styles.artists}>
                            {faixa.artists.map((artist, index) => (
                                <span
                                    key={`${artist.id ?? artist.name}-${index}`}
                                >
                                    {artist.id ? (
                                        <Link
                                            href={enderecoDoArtista(
                                                artist.id,
                                                artist.name
                                            )}
                                        >
                                            {artist.name}
                                        </Link>
                                    ) : (
                                        artist.name
                                    )}
                                    {index < faixa.artists.length - 1 && ', '}
                                </span>
                            ))}
                            {faixa.albumName && (
                                <span className={styles.album}>
                                    {' '}
                                    · {faixa.albumName}
                                </span>
                            )}
                        </p>

                        <div className={styles.player}>
                            <TrackPlayer
                                previewUrl={previaDoDeezer}
                                videoId={youtubeVideoId}
                                trackTitle={faixa.title}
                                artistName={faixa.artistNames}
                            />
                        </div>

                        {trackUri && (
                            <TrackActions
                                trackUri={trackUri}
                                isrc={isrc}
                                spotifyTrackId={faixa.spotifyTrackId}
                                trackUrl={linkExterno}
                                shareUrl={shareUrl}
                                trackTitle={faixa.title}
                                artistName={faixa.artistNames}
                                albumName={faixa.albumName || ''}
                                popularity={faixa.popularity ?? 0}
                                trackThumbnail={faixa.coverUrl || ''}
                                totalClaims={totalClaims}
                                isLoggedIn={isLoggedIn}
                                initialClaimed={hasUserClaimed}
                                userPosition={userClaimPosition}
                            />
                        )}
                    </div>
                </div>
            </header>

            {/* ============ FICHA ============ */}
            {specs.length > 0 && (
                <section className={styles.specs} aria-label="Ficha técnica">
                    <dl
                        className={`${shellStyles.container} ${styles.specsList}`}
                    >
                        {specs.map((s) => (
                            <div key={s.k}>
                                <dt>{s.k}</dt>
                                <dd>{s.v}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            {/* ============ REGISTRO E QUEM CHEGOU ANTES ============ */}
            <div className={`${shellStyles.container} ${styles.body}`}>
                <QuemSalvou
                    salvamentos={topClaimers}
                    total={totalClaims}
                    viewerId={viewerId}
                />

                <div className={styles.rail}>
                    <TrackReceipt
                        trackUri={trackUri ?? shareUrl}
                        trackTitle={faixa.title}
                        artistName={faixa.artistNames}
                        coverUrl={faixa.coverUrl}
                        year={releaseYear}
                        registro={registro}
                        totalClaims={totalClaims}
                        popularity={faixa.popularity}
                        medindoDesde={curva?.observedSince ?? null}
                    />
                </div>
            </div>

            {/* ============ OBSERVATÓRIO ============ */}
            {curva && <TrackCurve curva={curva} />}
        </div>
    )
}
