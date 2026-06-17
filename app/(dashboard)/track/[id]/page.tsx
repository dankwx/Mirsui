// app/(dashboard)/track/[id]/page.tsx — redesign na direção Acervo

import { createClient } from '@/utils/supabase/server'
import { fetchAuthData } from '@/utils/profileService'
import { fetchSpotifyTrackInfo, SpotifyTrack } from '@/utils/spotifyService'
import { countTrackOccurrences } from '@/utils/fetchTrackInfo'
import { getTopTrackClaimers } from '@/utils/trackPopularityService'
import { searchYouTubeVideo } from '@/utils/youtubeService'
import TrackActions from '@/components/TrackActions/TrackActions'
import TrackPreviewBar from '@/components/TrackPreviewBar/TrackPreviewBar'
import type { Metadata } from 'next'

import Link from 'next/link'
import { ArrowLeft, Clock, Crown, TrendingUp } from 'lucide-react'

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

// Ficha técnica (dados estáticos — ainda não vêm da API)
const SPEC = [
    { k: 'Gênero', v: 'Synthpop · R&B' },
    { k: 'Gravadora', v: 'XO, Republic' },
    { k: 'Produção', v: 'The Weeknd, Max Martin' },
    { k: 'BPM', v: '171' },
    { k: 'Tom', v: 'F♯ menor' },
]

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

    let totalClaims = 0
    if (trackInfo?.uri) {
        totalClaims = await countTrackOccurrences(trackInfo.uri)
    }

    let topClaimers: any[] = []
    if (trackInfo?.uri) {
        topClaimers = await getTopTrackClaimers(trackInfo.uri, 8)
    }

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

    // Busca o vídeo da música no YouTube para a prévia
    let youtubeVideoId: string | null = null
    if (trackInfo?.name) {
        const youtubeUrl = await searchYouTubeVideo(trackInfo.name, artistNames)
        if (youtubeUrl) {
            const match = youtubeUrl.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
            )
            youtubeVideoId = match ? match[1] : null
        }
    }

    const coverTone = tone(artistNames + (trackInfo?.name || ''))

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

                    <div className="flex flex-col gap-7 md:flex-row md:items-start md:gap-[38px]">
                        {/* Capa */}
                        <div className="w-[180px] flex-none sm:w-[230px] md:w-[270px]">
                            {albumImageUrl ? (
                                <img
                                    src={albumImageUrl}
                                    alt={`Capa de ${trackInfo?.album.name || 'álbum'}`}
                                    className="aspect-square w-full rounded-2xl border border-mir-line2 object-cover shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                                />
                            ) : (
                                <div
                                    className="mir-cover relative aspect-square w-full rounded-2xl border border-mir-line2 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                                    style={{ ['--tone' as string]: coverTone }}
                                >
                                    <span className="absolute bottom-1 left-3.5 select-none text-[84px] font-extrabold leading-[0.8] tracking-[-0.05em] text-white/[0.07]">
                                        {initials(artistNames)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1 pt-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(132,184,106,0.32)] bg-mir-acc-soft py-1 pl-2 pr-2.5 text-[11px] font-bold tracking-[0.02em] text-mir-acc">
                                    <TrendingUp className="h-3 w-3" /> Em alta
                                </span>
                                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-mir-text3">
                                    {SPEC[0].v}
                                </span>
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

            <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-10">
                <div className="h-px bg-mir-line" />
            </div>

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
                    {/* Ficha técnica */}
                    <section className="rounded-2xl border border-mir-line bg-mir-surface px-[22px] py-5">
                        <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-mir-text2">
                            Ficha técnica
                        </span>
                        <dl className="mt-4 flex flex-col">
                            {SPEC.map((s) => (
                                <div
                                    key={s.k}
                                    className="flex items-baseline justify-between gap-4 border-b border-mir-line py-[11px] last:border-b-0 last:pb-0"
                                >
                                    <dt className="whitespace-nowrap text-[12.5px] text-mir-text3">
                                        {s.k}
                                    </dt>
                                    <dd className="text-right text-[13px] font-semibold text-mir-text">
                                        {s.v}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    {/* Reivindicações */}
                    <section className="rounded-2xl border border-mir-line bg-mir-surface px-[22px] py-5">
                        <div className="flex items-baseline justify-between gap-2.5">
                            <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-mir-text2">
                                Reivindicações
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mir-text3">
                                {totalClaims} no total
                            </span>
                        </div>
                        {topClaimers.length > 0 ? (
                            <ol className="mt-4 flex flex-col">
                                {topClaimers.map((claimer, index) => {
                                    const profile = Array.isArray(claimer.profiles)
                                        ? claimer.profiles[0]
                                        : claimer.profiles
                                    const name =
                                        profile?.display_name ||
                                        profile?.username ||
                                        'Usuário'
                                    const isFirst = (claimer.position ?? index + 1) === 1
                                    return (
                                        <li
                                            key={claimer.user_id}
                                            className="grid grid-cols-[24px_34px_1fr] items-center gap-3 border-b border-mir-line py-[9px] first:pt-0 last:border-b-0 last:pb-0"
                                        >
                                            <span
                                                className={`grid place-items-center text-center font-mono text-[12px] tabular-nums ${
                                                    isFirst ? 'text-mir-acc' : 'text-mir-text3'
                                                }`}
                                            >
                                                {isFirst ? (
                                                    <Crown className="h-[13px] w-[13px]" />
                                                ) : (
                                                    String(claimer.position ?? index + 1).padStart(2, '0')
                                                )}
                                            </span>
                                            <span className="flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-full border border-mir-line2 bg-[radial-gradient(120%_120%_at_30%_22%,#322c22,#1b1813)] text-[13px] font-bold text-mir-text">
                                                {profile?.avatar_url ? (
                                                    <img
                                                        src={profile.avatar_url}
                                                        alt={name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    name.charAt(0).toUpperCase()
                                                )}
                                            </span>
                                            <Link
                                                href={`/user/${profile?.username || claimer.user_id}`}
                                                className="flex min-w-0 flex-col gap-0.5"
                                            >
                                                <span className="truncate text-[13.5px] font-semibold text-mir-text">
                                                    {name}
                                                </span>
                                                <span className="font-mono text-[10.5px] text-mir-text3">
                                                    {isFirst ? 'primeiro hipster' : 'reivindicou'} ·{' '}
                                                    {claimWhen(claimer.claimedat)}
                                                </span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ol>
                        ) : (
                            <p className="mt-4 py-2 text-center font-mono text-[12px] text-mir-text3">
                                Ninguém reivindicou ainda
                            </p>
                        )}
                    </section>

                    {/* Números */}
                    <section className="rounded-2xl border border-mir-line bg-mir-surface px-[22px] py-5">
                        <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-mir-text2">
                            Números
                        </span>
                        <div className="mt-4 flex overflow-hidden rounded-xl border border-mir-line">
                            <div className="flex flex-1 flex-col gap-1.5 border-r border-mir-line px-3.5 py-3.5">
                                <span className="text-[22px] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-mir-text">
                                    {totalClaims}
                                </span>
                                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-mir-text3">
                                    reivindicações
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col gap-1.5 border-r border-mir-line px-3.5 py-3.5">
                                <span className="text-[22px] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-mir-text">
                                    {trackInfo?.popularity ?? '—'}
                                </span>
                                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-mir-text3">
                                    popularidade
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3.5">
                                <span className="text-[22px] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-mir-acc">
                                    2.1B
                                </span>
                                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-mir-text3">
                                    reproduções
                                </span>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}
