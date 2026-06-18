import Link from 'next/link'
import Image from 'next/image'
import MirsuiLogo from '@/components/MirsuiLogo/MirsuiLogo'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTrendingTracks, getRecentActivity } from '@/utils/homepageService'
import { formatTimestamp } from '@/utils/feedHelpers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'mirsui',
    description:
        'Cave som antes de todo mundo. Carimba, e fica registrado que a descoberta foi sua.',
}

/* ---------- primitivos visuais ---------- */
function Glyph({ size = 22 }: { size?: number }) {
    return <MirsuiLogo size={size} />
}

function ArrowIcon({ size = 16 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
        </svg>
    )
}

function PlayIcon({ size = 16 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M7 4.5v15l13-7.5z" />
        </svg>
    )
}

function TrendIcon({ size = 12 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M3 17l6-6 4 4 7-7" />
            <path d="M17 8h4v4" />
        </svg>
    )
}

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
function tic0(ts: string) {
    const v = formatTimestamp(ts)
    return v === 'agora mesmo' ? 'agora' : v
}
function trackHref(track: { track_url?: string | null; track_title: string }) {
    return `/track/${track.track_url?.split('/').pop() || track.track_title}`
}

export default async function HomePage() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
        redirect('/feed')
    }

    const [trendingTracks, recentActivity] = await Promise.all([
        getTrendingTracks(8),
        getRecentActivity(8),
    ])

    // monta o feed do ticker a partir da atividade real (duplicado p/ loop perfeito)
    const tickerBase = recentActivity.map((t: any) => ({
        who: t.profiles?.display_name || t.profiles?.username || 'Alguém',
        track: t.track_title as string,
        artist: t.artist_name as string,
        ago: tic0(t.claimedat),
    }))
    const tickerItems =
        tickerBase.length > 0 ? [...tickerBase, ...tickerBase] : []

    return (
        <div className="mir-landing">
            {/* ============ HERO ============ */}
            <header className="hero">
                <div className="hero-photo" aria-hidden="true" />
                <div className="hero-grain" aria-hidden="true" />

                {/* nav flutuante */}
                <div className="lp-nav">
                    <nav className="nav wrap">
                        <Link href="/" className="logo">
                            <Glyph /> mirsui
                        </Link>
                        <div className="links">
                            <a href="#cena">A cena</a>
                            <a href="#manifesto">Sobre</a>
                        </div>
                        <div className="nav-right">
                            <AuthModalTrigger className="b b-light" mode="login">
                                Entrar
                            </AuthModalTrigger>
                            <AuthModalTrigger className="b b-acc" mode="signup">
                                Criar conta
                            </AuthModalTrigger>
                        </div>
                    </nav>
                </div>

                <div className="hero-inner wrap">
                    <span className="hero-kick">
                        <span className="live-dot" /> A cena, ao vivo
                    </span>
                    <h1>mir? sui.</h1>
                    <p className="hero-sub">
                        Você vai entender daqui 6 meses.
                    </p>
                    <div className="hero-cta">
                        <AuthModalTrigger className="b b-acc" mode="signup">
                            Criar conta grátis <ArrowIcon size={16} />
                        </AuthModalTrigger>
                        <AuthModalTrigger className="b b-light" mode="login">
                            Já tenho conta
                        </AuthModalTrigger>
                    </div>
                </div>

                {/* ticker ao vivo */}
                {tickerItems.length > 0 && (
                    <div className="ticker" aria-hidden="true">
                        <div className="ticker-lead">
                            <span className="live-dot" /> ao vivo
                        </div>
                        <div className="ticker-track">
                            {tickerItems.map((it, i) => (
                                <span className="ti" key={i}>
                                    <span className="early-dot" />
                                    <b>{it.who}</b> carimbou{' '}
                                    <span className="tk">{it.track}</span> —{' '}
                                    {it.artist}
                                    <span className="ago">· {it.ago}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* ============ SUBINDO NA CENA ============ */}
            {trendingTracks.length > 0 && (
                <section className="wall-sec" id="cena">
                    <div className="wrap">
                        <div className="wall-head">
                            <div className="sec-head">
                                <span className="eyebrow">
                                    <span className="early-dot" /> Subindo na cena
                                </span>
                                <h2>O que tá sendo carimbado agora.</h2>
                                <p className="sh-sub">
                                    Ainda dá tempo de salvar antes de virar
                                    tendência.
                                </p>
                            </div>
                            <AuthModalTrigger className="b b-solid" mode="login">
                                Explorar tudo <ArrowIcon size={15} />
                            </AuthModalTrigger>
                        </div>

                        <div className="hwall">
                            {trendingTracks.map((t, i) => (
                                <AuthModalTrigger
                                    as="div"
                                    className="poster"
                                    mode="login"
                                    key={t.id}
                                >
                                    <div className="cover-wrap">
                                        <span className="rank-chip">
                                            #{String(i + 1).padStart(2, '0')}
                                        </span>
                                        {i < 2 && (
                                            <span className="ear-tab">early</span>
                                        )}
                                        <div
                                            className="cover-art mir-cover"
                                            style={
                                                {
                                                    '--tone': tone(
                                                        t.artist_name
                                                    ),
                                                } as React.CSSProperties
                                            }
                                        >
                                            {t.track_thumbnail ? (
                                                <Image
                                                    src={t.track_thumbnail}
                                                    alt={`Capa de ${t.track_title}`}
                                                    width={240}
                                                    height={240}
                                                />
                                            ) : (
                                                <span className="mir-cover-ini">
                                                    {initials(t.artist_name)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="play">
                                            <PlayIcon size={16} />
                                        </span>
                                    </div>
                                    <div className="ptt">{t.track_title}</div>
                                    <div className="par">{t.artist_name}</div>
                                    <div className="padds">
                                        <TrendIcon size={12} /> +{t.total_claims}{' '}
                                        essa semana
                                    </div>
                                </AuthModalTrigger>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ============ MANIFESTO ============ */}
            <section className="manifesto wrap" id="manifesto">
                <p>
                    O algoritmo te entrega o que já bombou. O Mirsui guarda o que
                    você ouviu <em>antes</em>.
                </p>
                <div className="sig">Mirsui — acervo de quem ouve primeiro</div>
            </section>

            {/* ============ CTA FINAL ============ */}
            <section className="endcta wrap">
                <h2>Entra e começa a cavar.</h2>
                <p>
                    Som novo todo dia. Carimba o que você curtir e monta o
                    histórico de quem ouviu antes.
                </p>
                <div>
                    <AuthModalTrigger className="b b-acc" mode="signup">
                        Criar conta grátis <ArrowIcon size={16} />
                    </AuthModalTrigger>
                </div>
                <div className="fine">Grátis · sem cartão · sem algoritmo</div>
            </section>
        </div>
    )
}
