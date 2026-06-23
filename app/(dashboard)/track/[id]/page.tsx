// app/(dashboard)/track/[id]/page.tsx — redesign na direção Acervo

import { createClient } from '@/utils/supabase/server'
import { fetchAuthData } from '@/utils/profileService'
import {
    fetchSpotifyTrackInfo,
    fetchSpotifyArtistInfo,
    SpotifyTrack,
} from '@/utils/spotifyService'
import { fetchDeezerGenresByISRC } from '@/utils/deezerService'
import { countTrackOccurrences } from '@/utils/fetchTrackInfo'
import { getTopTrackClaimers } from '@/utils/trackPopularityService'
import { searchYouTubeVideo } from '@/utils/youtubeService'
import TrackActions from '@/components/TrackActions/TrackActions'
import TrackSelo from '@/components/TrackSelo/TrackSelo'
import TrackPreviewBar from '@/components/TrackPreviewBar/TrackPreviewBar'
import ProfileFooter from '@/components/Profile/ProfileFooter'
import type { Metadata } from 'next'

import Link from 'next/link'
import { ArrowLeft, Clock, Crown, Flag, TrendingUp } from 'lucide-react'

export async function generateMetadata({
    params,
}: {
    params: { id: string }
}): Promise<Metadata> {
    const trackInfo = await fetchSpotifyTrackInfo(params.id)

    if (trackInfo) {
        const artistNames =
            trackInfo.artists?.map((artist) => artist.name).join(', ') ||
            'Artista Desconhecido'
        return {
            title: `${trackInfo.name} - ${artistNames} | Mirsui`,
            description: `Descubra quem cravou "${trackInfo.name}" de ${artistNames} antes de virar mainstream. Reivindique sua descoberta no Mirsui.`,
        }
    }

    return {
        title: 'Faixa - Mirsui',
        description: 'Descubra informações sobre esta faixa no Mirsui.',
    }
}

/* ---------- helpers de apresentação (direção Acervo) ---------- */
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
// Formata a data de lançamento respeitando a precisão do Spotify
// (ano / ano-mês / ano-mês-dia)
function formatReleaseDate(date?: string) {
    if (!date) return null
    const [y, m, d] = date.split('-')
    if (d) return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]} ${y}`
    if (m) return `${MONTHS[parseInt(m, 10) - 1]} ${y}`
    return y
}
// Gêneros do Spotify vêm em minúsculas ("canadian contemporary r&b").
// Pega os 2 primeiros e capitaliza cada palavra para exibição.
function formatGenres(genres?: string[] | null) {
    if (!genres || genres.length === 0) return null
    return genres
        .slice(0, 2)
        .map((g) =>
            g
                .split(' ')
                .map((w) =>
                    w === 'r&b' ? 'R&B' : w.charAt(0).toUpperCase() + w.slice(1)
                )
                .join(' ')
        )
        .join(' · ')
}
// Seguidores do artista, formatado em pt-BR (1,2 mi · 340 mil · 8.450)
function formatFollowers(n?: number) {
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

export default async function TrackDetailsPage({
    params,
}: {
    params: { id: string }
}) {
    const { id: trackId } = params

    const authData = await fetchAuthData()
    const isLoggedIn = authData?.user ? true : false

    let trackInfo: SpotifyTrack | null = null
    if (trackId) {
        trackInfo = await fetchSpotifyTrackInfo(trackId)
    }

    const artists =
        trackInfo?.artists?.map((artist) => ({
            name: artist.name,
            id: artist.id,
        })) || []
    const artistNames =
        artists.map((artist) => artist.name).join(', ') || 'Artista Desconhecido'
    const albumImageUrl = trackInfo?.album.images?.[0]?.url || ''
    const releaseYear = trackInfo?.album.release_date
        ? new Date(trackInfo.album.release_date).getFullYear()
        : null
    const duration = trackInfo
        ? `${Math.floor(trackInfo.duration_ms / 60000)}:${Math.floor(
              (trackInfo.duration_ms % 60000) / 1000
          )
              .toString()
              .padStart(2, '0')}`
        : '0:00'

    // Gênero não vem na track — buscamos no artista principal
    let genre: string | null = null
    let followers: number | undefined
    const primaryArtistId = trackInfo?.artists?.[0]?.id
    if (primaryArtistId) {
        const artistInfo = await fetchSpotifyArtistInfo(String(primaryArtistId))
        genre = formatGenres(artistInfo?.genres)
        followers = artistInfo?.followers?.total
    }
    // Spotify costuma deixar genres vazio p/ artistas BR/indie — cai no Deezer
    const isrc = trackInfo?.external_ids?.isrc || null
    if (!genre && isrc) {
        genre = formatGenres(await fetchDeezerGenresByISRC(isrc))
    }

    // Ficha técnica — dados reais (Spotify + fallback Deezer)
    const specs = [
        genre && { k: 'Gênero', v: genre },
        trackInfo?.album.release_date && {
            k: 'Lançamento',
            v: formatReleaseDate(trackInfo.album.release_date),
        },
        followers != null && {
            k: 'Ouvintes',
            v: `${formatFollowers(followers)} seguidores`,
        },
    ].filter(Boolean) as { k: string; v: string }[]

    let totalClaims = 0
    if (trackInfo?.uri) {
        totalClaims = await countTrackOccurrences(trackInfo.uri)
    }

    let topClaimers: any[] = []
    if (trackInfo?.uri) {
        topClaimers = await getTopTrackClaimers(trackInfo.uri, 8)
    }

    const firstClaimer = topClaimers[0]
    const firstClaimerProfile = Array.isArray(firstClaimer?.profiles)
        ? firstClaimer?.profiles[0]
        : firstClaimer?.profiles
    const firstClaimerName =
        firstClaimerProfile?.display_name ||
        firstClaimerProfile?.username ||
        'Alguém'

    // Verifica se o usuário atual já reivindicou esta faixa
    let hasUserClaimed = false
    let userClaimPosition: number | null = null

    if (isLoggedIn && trackInfo?.uri) {
        const supabase = await createClient()
        const { data: userClaim, error } = await supabase
            .from('tracks')
            .select('position')
            .eq('user_id', authData.user?.id)
            .eq('track_uri', trackInfo.uri)
            .single()

        if (!error && userClaim) {
            hasUserClaimed = true
            userClaimPosition = userClaim.position
        }
    }

    const trackUrl = `https://open.spotify.com/track/${trackId}`

    // Prévia do YouTube: consulta o cache (Spotify id -> YouTube id) antes de
    // gastar cota da YouTube Data API (10k unidades/dia, 100 por busca). Só
    // chama a API em cache miss, e persiste o resultado para nunca repetir.
    let youtubeVideoId: string | null = null
    if (trackInfo?.name) {
        const supabase = await createClient()
        const { data: cached } = await supabase
            .from('youtube_cache')
            .select('youtube_video_id')
            .eq('spotify_track_id', trackId)
            .maybeSingle()

        if (cached) {
            youtubeVideoId = cached.youtube_video_id
        } else {
            const youtubeUrl = await searchYouTubeVideo(
                trackInfo.name,
                artistNames
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
                    p_spotify_id: trackId,
                    p_video_id: youtubeVideoId,
                })
            }
        }
    }

    const coverTone = tone(artistNames + (trackInfo?.name || ''))

    // Selo editorial — derivados determinísticos para o rodapé
    let seed = 0
    for (let i = 0; i < trackId.length; i++)
        seed = (seed * 31 + trackId.charCodeAt(i)) >>> 0
    const trackNo = String(seed % 1000).padStart(3, '0')
    const footerSince = releaseYear || 2024

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
                            {albumImageUrl ? (
                                <img
                                    src={albumImageUrl}
                                    alt={`Capa de ${trackInfo?.album.name || 'álbum'}`}
                                    className="aspect-square w-full object-cover"
                                />
                            ) : (
                                <div
                                    className="mir-cover relative aspect-square w-full"
                                    style={{ ['--tone' as string]: coverTone }}
                                >
                                    <span className="absolute bottom-1 left-3.5 select-none text-[84px] font-extrabold leading-[0.8] tracking-[-0.05em] text-white/[0.07]">
                                        {initials(artistNames)}
                                    </span>
                                </div>
                            )}
                            <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(205,239,54,0.4)] bg-[rgba(22,18,12,0.62)] px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-mir-acc backdrop-blur-sm">
                                <Flag className="h-2.5 w-2.5" /> Janela fechada
                            </span>
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1 pt-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(205,239,54,0.4)] bg-mir-acc-soft py-1 pl-2 pr-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-mir-acc">
                                    <TrendingUp className="h-3 w-3" /> Em alta
                                </span>
                                {genre && (
                                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-mir-text3">
                                        {genre}
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-3.5 text-[clamp(38px,6vw,68px)] font-extrabold leading-[0.94] tracking-[-0.04em] text-mir-text">
                                {trackInfo?.name || 'Faixa Desconhecida'}
                            </h1>

                            {artists.length > 0 ? (
                                <div className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5 text-[clamp(18px,2.2vw,23px)] font-bold leading-tight tracking-[-0.01em]">
                                    {artists.map((artist, index) => (
                                        <span key={artist.id}>
                                            <Link
                                                href={`/artist/${artist.id}`}
                                                className="text-mir-acc transition hover:brightness-[1.12]"
                                            >
                                                {artist.name}
                                            </Link>
                                            {index < artists.length - 1 && (
                                                <span className="text-mir-text3">,</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2.5 text-[clamp(18px,2.2vw,23px)] font-bold text-mir-acc">
                                    {artistNames}
                                </p>
                            )}

                            <div className="mt-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[12.5px] text-mir-text2">
                                <span>{trackInfo?.album.name || 'Álbum'}</span>
                                <span className="text-mir-text3">·</span>
                                <span>{releaseYear || '—'}</span>
                                <span className="text-mir-text3">·</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" /> {duration}
                                </span>
                            </div>

                            {trackInfo && (
                                <TrackActions
                                    trackUri={trackInfo.uri}
                                    trackUrl={trackUrl}
                                    trackTitle={trackInfo.name}
                                    artistName={artistNames}
                                    albumName={trackInfo.album.name}
                                    popularity={trackInfo.popularity}
                                    trackThumbnail={albumImageUrl}
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
                    {trackInfo && (
                        <TrackPreviewBar
                            videoId={youtubeVideoId}
                            spotifyUrl={trackUrl}
                            trackTitle={trackInfo.name}
                            artistName={artistNames}
                        />
                    )}
                </main>

                {/* Rail */}
                <aside className="flex flex-col gap-[18px] lg:sticky lg:top-[84px]">
                    {trackInfo && (
                        <TrackSelo
                            trackUri={trackInfo.uri}
                            trackTitle={trackInfo.name}
                            artistName={artistNames}
                            albumImageUrl={albumImageUrl}
                            claimed={hasUserClaimed}
                            position={userClaimPosition}
                            year={releaseYear}
                            totalClaims={totalClaims}
                            isLoggedIn={isLoggedIn}
                        />
                    )}
                </aside>
            </div>

            {/* ============ A PROVA ============ */}
            {topClaimers.length > 0 && (
                <section className="bg-[#ece3d2] text-mir-bg">
                    <div className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-10">
                        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c14a26]">
                            ★ A prova
                        </div>

                        <div className="mt-3.5 flex flex-wrap items-end justify-between gap-4">
                            <h2 className="m-0 max-w-[560px] text-[clamp(30px,4.5vw,52px)] font-black leading-[0.96] tracking-[-0.04em]">
                                {firstClaimerName} ouviu{' '}
                                <span className="text-[#c14a26]">antes</span> do mundo.
                            </h2>
                            <p className="m-0 max-w-[280px] font-mono text-[12px] leading-relaxed text-mir-bg/60">
                                A janela abre quando a faixa ainda é obscura e fecha
                                quando vira tendência. Reivindicar dentro dela é o
                                que entra pra história.
                            </p>
                        </div>

                        {/* Timeline */}
                        <div className="mt-10 rounded-xl border border-mir-bg/10 bg-[#efe7d6] px-7 pb-7 pt-9">
                            <div className="relative my-3.5 h-[3px] rounded-sm bg-mir-bg/20">
                                <div className="absolute left-[8%] right-[24%] top-0 h-[3px] rounded-sm bg-mir-bg" />
                                <div className="absolute left-[8%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-mir-bg bg-mir-acc" />
                                <div className="absolute left-[76%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-mir-bg bg-[#c14a26]" />
                            </div>
                            <div className="flex justify-between font-mono text-[11px] tracking-[0.04em]">
                                <div className="text-left">
                                    <div className="font-bold text-mir-bg">
                                        {firstClaimerName} reivindicou
                                    </div>
                                    <div className="mt-0.5 text-mir-bg/50">
                                        {claimWhen(firstClaimer?.claimedat)} · obscura
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-[#c14a26]">
                                        em alta agora
                                    </div>
                                    <div className="mt-0.5 text-mir-bg/50">
                                        pico · {trackInfo?.popularity ?? '—'} popular.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reivindicações */}
                        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="m-0 text-[22px] font-extrabold tracking-[-0.02em]">
                                Reivindicações
                            </h3>
                            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mir-bg/50">
                                {totalClaims} no total · janela fechada
                            </span>
                        </div>
                        <ol className="mt-3.5 flex flex-col gap-2.5">
                            {topClaimers.map((claimer, index) => {
                                const profile = Array.isArray(claimer.profiles)
                                    ? claimer.profiles[0]
                                    : claimer.profiles
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
                                        <span className="w-6 flex-none text-center font-mono text-[18px] font-bold text-[#c14a26]">
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
                                                    ? 'primeiro a reivindicar'
                                                    : 'reivindicou'}{' '}
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

            <ProfileFooter profileNo={trackNo} memberSince={footerSince} />
        </div>
    )
}
