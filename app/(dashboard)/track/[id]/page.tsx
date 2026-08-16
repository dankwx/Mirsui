// app/(dashboard)/track/[id]/page.tsx
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

import { permanentRedirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { fetchAuthData } from '@/utils/profileService'
import { searchYouTubeVideo } from '@/utils/youtubeService'
import { getTrackCurve } from '@/utils/observatoryService'
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
    type DadosDaFaixa,
} from '@/utils/trackPageService'
import {
    contarSalvamentos,
    quemSalvou,
    salvamentoDoUsuario,
} from '@/utils/trackClaims'
import TrackActions from '@/components/TrackActions/TrackActions'
import TrackShare from '@/components/TrackShare/TrackShare'
import TrackCurve from '@/components/TrackCurve/TrackCurve'
import TrackPreviewBar from '@/components/TrackPreviewBar/TrackPreviewBar'
import LandingFooter from '@/components/Footer/LandingFooter'
import type { Metadata } from 'next'

import Link from 'next/link'
import { ArrowLeft, Clock, Crown } from 'lucide-react'

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

/* ------------------------- helpers de apresentação (direção Acervo) ------- */

const TONES = [
    '#241f1a', '#1c2320', '#27201f', '#1b2026', '#231d27', '#202420',
    '#2a201b', '#1a2326', '#25211c', '#1d2126', '#26211f', '#1f231d',
]
function tone(seed: string) {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
    return TONES[h % TONES.length]
}
function initials(name: string) {
    return (name || '')
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
// O Deezer manda a data completa (YYYY-MM-DD), mas o parse continua tolerante:
// o campo pode vir do álbum, com precisão de ano ou de mês.
function formatReleaseDate(date?: string | null) {
    if (!date) return null
    const [y, m, d] = date.split('-')
    if (d) return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]} ${y}`
    if (m) return `${MONTHS[parseInt(m, 10) - 1]} ${y}`
    return y
}
// O gênero do Deezer já vem apresentável e em português ("Rap/Hip Hop",
// "Samba/Pagode") — diferente do Spotify, que mandava "canadian contemporary
// r&b" em minúsculas. Sobrou juntar os dois primeiros.
function formatGenres(genres?: string[] | null) {
    if (!genres || genres.length === 0) return null
    return genres.slice(0, 2).join(' · ')
}
// Número de pessoas, formatado em pt-BR (1,2 mi · 340 mil · 8.450)
function formatFollowers(n?: number | null) {
    if (n == null) return null
    if (n >= 1_000_000) {
        const m = (n / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '')
        return `${m} mi`
    }
    if (n >= 1_000) return `${Math.round(n / 1000)} mil`
    return n.toLocaleString('pt-BR')
}
function claimWhen(ts: string | null) {
    if (!ts) return ''
    const d = new Date(ts)
    const days = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (days < 1) return 'hoje'
    if (days < 30) return days === 1 ? 'há 1 dia' : `há ${days} dias`
    const months = Math.floor(days / 30)
    if (months < 12) return months === 1 ? 'há 1 mês' : `há ${months} meses`
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
function fullDate(ts?: string | null) {
    if (!ts) return '—'
    const d = new Date(ts)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
/** O Deezer conta duração em segundos; o Spotify contava em milissegundos. */
function formatDuration(segundos: number) {
    if (!segundos) return '0:00'
    const m = Math.floor(segundos / 60)
    const s = Math.floor(segundos % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
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

    // Curva do Observatório — o histórico de audiência que o Mirsui mede todo
    // dia, casado por ISRC. Independe do Deezer estar respondendo agora: isto
    // já está no nosso banco.
    const curva = await getTrackCurve(isrc)

    const [totalClaims, topClaimers, meuSalvamento] = await Promise.all([
        contarSalvamentos(trackUri, isrc),
        quemSalvou(trackUri, isrc, 8),
        isLoggedIn && authData.user?.id
            ? salvamentoDoUsuario(authData.user.id, trackUri, isrc)
            : Promise.resolve(null),
    ])

    const hasUserClaimed = !!meuSalvamento
    const userClaimPosition = meuSalvamento?.position ?? null

    const genre = formatGenres(faixa.genres)
    const releaseYear = faixa.releaseDate
        ? new Date(faixa.releaseDate).getFullYear()
        : null

    // Ficha técnica — só o que é medido de verdade. Linha sem valor não aparece.
    const specs = [
        genre && { k: 'Gênero', v: genre },
        faixa.releaseDate && {
            k: 'Lançamento',
            v: formatReleaseDate(faixa.releaseDate),
        },
        faixa.followers != null && {
            k: 'Artista',
            v: `${formatFollowers(faixa.followers)} fãs no Deezer`,
        },
    ].filter(Boolean) as { k: string; v: string }[]

    const firstClaimer = topClaimers[0] as
        | { profiles?: unknown; claimedat?: string | null; position?: number }
        | undefined
    const firstClaimerProfile = Array.isArray(firstClaimer?.profiles)
        ? (firstClaimer?.profiles as Record<string, string>[])[0]
        : (firstClaimer?.profiles as Record<string, string> | undefined)
    const firstClaimerName =
        firstClaimerProfile?.display_name ||
        firstClaimerProfile?.username ||
        'Alguém'

    /**
     * Prévia do YouTube: agora é a SEGUNDA opção, atrás do MP3 que o Deezer
     * entrega no mesmo objeto da faixa. Só roda quando não veio prévia do
     * Deezer e quando existe id do Spotify — que é a chave de `youtube_cache`
     * (migrations 002 e 017). Na prática isso reduz o consumo da cota do
     * YouTube (100 buscas/dia para o site inteiro) a quase zero.
     */
    let youtubeVideoId: string | null = null
    if (!faixa.previewUrl && faixa.spotifyTrackId) {
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

    const coverTone = tone(faixa.artistNames + faixa.title)

    return (
        <div>
            {/* ============ HERO ============ */}
            <header className="relative overflow-hidden pb-[38px] pt-[34px]">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[6%] -top-[40%] z-0 h-[560px] w-[560px] opacity-60 blur-[36px]"
                    style={{
                        background: `radial-gradient(closest-side, color-mix(in srgb, ${coverTone} 70%, transparent), transparent 72%)`,
                    }}
                />

                <div className="relative z-[1] mx-auto w-full max-w-[1180px] px-5 sm:px-10">
                    <Link
                        href="/feed"
                        className="inline-flex w-max items-center gap-1.5 pb-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-mir-text3 transition-colors hover:text-mir-text"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
                    </Link>

                    <div className="flex flex-col gap-7 md:flex-row md:items-start md:gap-[46px]">
                        {/* Capa */}
                        <div className="relative w-[200px] flex-none overflow-hidden rounded-[10px] border border-mir-line2 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] sm:w-[260px] md:w-[330px]">
                            {faixa.coverUrl ? (
                                <img
                                    src={faixa.coverUrl}
                                    alt={`Capa de ${faixa.albumName || 'álbum'}`}
                                    className="aspect-square w-full object-cover"
                                />
                            ) : (
                                <div
                                    className="mir-cover relative aspect-square w-full"
                                    style={{ ['--tone' as string]: coverTone }}
                                >
                                    <span className="absolute bottom-1 left-3.5 select-none text-[84px] font-extrabold leading-[0.8] tracking-[-0.05em] text-white/[0.07]">
                                        {initials(faixa.artistNames)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1 pt-1">
                            <div className="flex flex-wrap items-center gap-3">
                                {genre && (
                                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-mir-text3">
                                        {genre}
                                    </span>
                                )}
                                {faixa.explicit && (
                                    <span className="rounded-[4px] border border-mir-line2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-mir-text3">
                                        Explícito
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-3.5 text-[clamp(38px,6vw,68px)] font-extrabold leading-[0.94] tracking-[-0.04em] text-mir-text">
                                {faixa.title}
                            </h1>

                            <div className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5 text-[clamp(18px,2.2vw,23px)] font-bold leading-tight tracking-[-0.01em]">
                                {faixa.artists.map((artist, index) => (
                                    <span key={`${artist.id ?? artist.name}-${index}`}>
                                        {artist.id ? (
                                            <Link
                                                href={enderecoDoArtista(artist.id, artist.name)}
                                                className="text-mir-text transition hover:text-mir-text2"
                                            >
                                                {artist.name}
                                            </Link>
                                        ) : (
                                            <span className="text-mir-text">
                                                {artist.name}
                                            </span>
                                        )}
                                        {index < faixa.artists.length - 1 && (
                                            <span className="text-mir-text3">,</span>
                                        )}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[12.5px] text-mir-text2">
                                <span>{faixa.albumName || 'Álbum'}</span>
                                <span className="text-mir-text3">·</span>
                                <span>{releaseYear || '—'}</span>
                                {faixa.duration > 0 && (
                                    <>
                                        <span className="text-mir-text3">·</span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />{' '}
                                            {formatDuration(faixa.duration)}
                                        </span>
                                    </>
                                )}
                            </div>

                            {trackUri && (
                                <TrackActions
                                    trackUri={trackUri}
                                    isrc={isrc}
                                    trackUrl={linkExterno}
                                    shareUrl={shareUrl}
                                    trackTitle={faixa.title}
                                    artistName={faixa.artistNames}
                                    albumName={faixa.albumName || ''}
                                    popularity={faixa.popularity ?? 0}
                                    trackThumbnail={faixa.coverUrl || ''}
                                    totalClaims={totalClaims}
                                    initialClaimed={hasUserClaimed}
                                    userPosition={userClaimPosition}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== Ficha técnica — faixa full-bleed (sem card) ===== */}
            {specs.length > 0 && (
                <section className="border-y border-mir-line">
                    <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-10">
                        <dl className="flex flex-wrap">
                            {specs.map((s) => (
                                <div
                                    key={s.k}
                                    className="min-w-[128px] flex-1 border-mir-line py-[18px] pr-7 [&:not(:first-child)]:border-l [&:not(:first-child)]:pl-7"
                                >
                                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-mir-text3">
                                        {s.k}
                                    </dt>
                                    <dd className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-mir-text">
                                        {s.v}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>
            )}

            {/* ============ CORPO ============ */}
            <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 items-start gap-9 px-5 pb-[72px] pt-[34px] sm:px-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-[44px]">
                {/* Main */}
                <main className="flex min-w-0 flex-col gap-9">
                    <TrackPreviewBar
                        previewUrl={faixa.previewUrl}
                        videoId={youtubeVideoId}
                        isrc={isrc}
                        spotifyTrackId={faixa.spotifyTrackId}
                        trackTitle={faixa.title}
                        artistName={faixa.artistNames}
                    />
                    {curva && <TrackCurve curva={curva} />}
                </main>

                {/* Rail */}
                <aside className="flex flex-col gap-[18px] lg:sticky lg:top-[84px]">
                    <TrackShare
                        trackUri={trackUri ?? shareUrl}
                        trackTitle={faixa.title}
                        artistName={faixa.artistNames}
                        albumImageUrl={faixa.coverUrl || ''}
                        year={releaseYear}
                        totalClaims={totalClaims}
                    />
                </aside>
            </div>

            {/* ============ A PROVA ============ */}
            {topClaimers.length > 0 && (
                <section className="bg-[#ece3d2] text-mir-bg">
                    <div className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-10">
                        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-mir-warm-ink">
                            ★ A prova
                        </div>

                        <div className="mt-3.5 flex flex-wrap items-end justify-between gap-4">
                            <h2 className="m-0 max-w-[560px] text-[clamp(30px,4.5vw,52px)] font-black leading-[0.96] tracking-[-0.04em]">
                                {firstClaimerName} ouviu{' '}
                                <span className="text-mir-warm-ink">antes</span> do mundo.
                            </h2>
                            {/* Recibo — registro autenticado da descoberta */}
                            <div className="w-full max-w-[300px]">
                                <div className="rounded-2xl border border-mir-bg/10 bg-[#f5eede] p-6 shadow-[0_24px_48px_-32px_rgba(22,18,12,0.55)]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] font-bold tracking-[-0.02em] text-mir-bg">
                                            Mirsui
                                        </span>
                                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mir-bg/40">
                                            Recibo
                                        </span>
                                    </div>

                                    <div className="mt-5">
                                        <div className="line-clamp-2 text-[19px] font-bold leading-tight tracking-[-0.02em] text-mir-bg">
                                            {faixa.title}
                                        </div>
                                        <div className="mt-1 truncate text-[13px] font-medium text-mir-bg/50">
                                            {faixa.artistNames}
                                        </div>
                                    </div>

                                    <div className="my-5 border-t border-dashed border-mir-bg/15" />

                                    <div>
                                        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-mir-bg/40">
                                            Primeiro a salvar
                                        </div>
                                        <div className="mt-1.5 text-[16px] font-bold tracking-[-0.01em] text-mir-bg">
                                            {firstClaimerName}
                                        </div>
                                        <div className="mt-0.5 text-[13px] font-medium text-mir-bg/50">
                                            {fullDate(firstClaimer?.claimedat)}
                                        </div>
                                    </div>

                                    <div className="my-5 border-t border-dashed border-mir-bg/15" />

                                    <dl className="space-y-2.5">
                                        <div className="flex items-baseline justify-between">
                                            <dt className="text-[13px] font-medium text-mir-bg/50">
                                                No acervo
                                            </dt>
                                            <dd className="text-[14px] font-bold tabular-nums text-mir-bg">
                                                {totalClaims}
                                            </dd>
                                        </div>
                                        <div className="flex items-baseline justify-between">
                                            <dt className="text-[13px] font-medium text-mir-bg/50">
                                                Audiência hoje
                                            </dt>
                                            <dd className="text-[14px] font-bold tabular-nums text-mir-bg">
                                                {faixa.popularity ?? '—'}
                                                <span className="text-mir-bg/40">
                                                    /100
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        {/* De lá até hoje.
                            As duas pontas são reais e agora estão na MESMA
                            escala: a audiência do recibo é popScore(rank) do
                            Deezer, que é exatamente o número que alimenta a
                            curva logo acima. Antes eram duas métricas de duas
                            empresas diferentes no mesmo bloco visual — o
                            "popularity" do Spotify aqui e o rank do Deezer no
                            gráfico. */}
                        <div className="mt-10 rounded-xl border border-mir-bg/10 bg-[#efe7d6] px-7 pb-7 pt-9">
                            <div className="relative my-3.5 h-[3px] rounded-sm bg-mir-bg/20">
                                <div className="absolute inset-x-0 top-0 h-[3px] rounded-sm bg-mir-bg/55" />
                                <div className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-mir-bg bg-mir-bg" />
                                <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-mir-bg bg-mir-warm-ink" />
                            </div>
                            <div className="flex justify-between gap-4 font-mono text-[11px] tracking-[0.04em]">
                                <div className="text-left">
                                    <div className="font-bold text-mir-bg">
                                        {firstClaimerName} salvou
                                    </div>
                                    <div className="mt-0.5 text-mir-bg/50">
                                        {claimWhen(firstClaimer?.claimedat ?? null)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-mir-warm-ink">
                                        audiência hoje
                                    </div>
                                    <div className="mt-0.5 tabular-nums text-mir-bg/50">
                                        {faixa.popularity ?? '—'}/100 medida pelo
                                        Observatório
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* quem já salvou a faixa */}
                        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="m-0 text-[22px] font-extrabold tracking-[-0.02em]">
                                Quem já salvou
                            </h3>
                            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mir-bg/50">
                                {totalClaims} no total
                            </span>
                        </div>
                        <ol className="mt-3.5 flex flex-col gap-2.5">
                            {topClaimers.map((claimer, index) => {
                                const profile = (
                                    Array.isArray(claimer.profiles)
                                        ? claimer.profiles[0]
                                        : claimer.profiles
                                ) as Record<string, string> | undefined
                                const name =
                                    profile?.display_name ||
                                    profile?.username ||
                                    'Usuário'
                                const isFirst =
                                    (claimer.position ?? index + 1) === 1
                                return (
                                    <li
                                        key={claimer.user_id}
                                        className="flex items-center gap-4 rounded-[10px] border border-mir-bg/10 bg-[#efe7d6] px-5 py-[18px]"
                                    >
                                        <span className="w-6 flex-none text-center font-mono text-[18px] font-bold text-mir-warm-ink">
                                            {isFirst ? (
                                                <Crown className="mx-auto h-[18px] w-[18px]" />
                                            ) : (
                                                String(
                                                    claimer.position ?? index + 1
                                                ).padStart(2, '0')
                                            )}
                                        </span>
                                        <span className="flex h-[46px] w-[46px] flex-none items-center justify-center overflow-hidden rounded-full border border-mir-bg/10 bg-[radial-gradient(130%_130%_at_30%_22%,#f3ecdb_0%,#cdef36_20%,#c14a26_52%,#16120c_88%)] text-[15px] font-bold text-mir-text">
                                            {profile?.avatar_url ? (
                                                <img
                                                    src={profile.avatar_url}
                                                    alt={name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </span>
                                        <Link
                                            href={`/user/${profile?.username || claimer.user_id}`}
                                            className="min-w-0 flex-1"
                                        >
                                            <div className="truncate text-[18px] font-extrabold tracking-[-0.02em]">
                                                {name}
                                            </div>
                                            <div className="mt-0.5 font-mono text-[11px] text-mir-bg/55">
                                                {isFirst
                                                    ? 'primeiro a salvar'
                                                    : 'salvou'}{' '}
                                                · {claimWhen(claimer.claimedat)}
                                            </div>
                                        </Link>
                                        {isFirst && (
                                            <span className="flex-none rounded-full bg-mir-bg px-[11px] py-[5px] font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-mir-acc">
                                                1º hipster
                                            </span>
                                        )}
                                    </li>
                                )
                            })}
                        </ol>
                    </div>
                </section>
            )}

            <LandingFooter compact />
        </div>
    )
}
