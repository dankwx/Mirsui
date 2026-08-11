import Link from 'next/link'
import Image from 'next/image'
import MirsuiLogo from '@/components/MirsuiLogo/MirsuiLogo'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import TrackWall from '@/components/TrackWall/TrackWall'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTrendingTracks, getRecentActivity } from '@/utils/homepageService'
import { getLandingObservatory } from '@/utils/observatoryService'
import { formatTimestamp } from '@/utils/feedHelpers'
import type { Metadata } from 'next'

const TITLE = 'mirsui'
const DESCRIPTION =
    'Salve a música antes dela estourar. Fica registrado que a descoberta foi sua.'

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Mirsui',
        title: TITLE,
        description: DESCRIPTION,
        url: '/',
        images: [{ url: '/api/og/landing', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/api/og/landing'],
    },
}

const HERO_PHOTO = '/assets/track-art2.webp'

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

/** O card abre o cadastro para salvar a faixa; não toca a música. */
function StampIcon({ size = 16 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
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

/**
 * Rota da ficha da faixa a partir do que a landing tem em mãos.
 *
 * `tracks.track_url` guarda a URL completa do Spotify com o parâmetro `si`
 * (https://open.spotify.com/track/<id>?si=...), e `track_uri` guarda
 * `spotify:track:<id>`. As duas formas aparecem, então a extração aceita ambas.
 *
 * Sem id reconhecível cai em '/feed' em vez de montar uma rota quebrada — a
 * página existe para qualquer id válido do Spotify, mas não para lixo.
 */
function trackHref(origem?: string | null): string {
    if (!origem) return '/feed'
    const m = origem.match(/(?:track[:/])([A-Za-z0-9]{22})/)
    return m ? `/track/${m[1]}` : '/feed'
}

const BEATS = [
    {
        title: 'Salva',
        body: 'Achou um som que quase ninguém ouviu ainda? Salva. Fica gravado o dia e a hora em que você chegou.',
    },
    {
        title: 'A faixa cresce',
        body: 'A gente acompanha o que acontece com ela depois. Quanto mais cedo você chegou, mais o achado vale.',
    },
    {
        title: 'A prova é sua',
        body: 'Seu acervo vira um selo compartilhável com a data. Não é opinião: é registro de que você ouviu antes.',
    },
]

export default async function HomePage() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
        redirect('/feed')
    }

    const [trendingTracks, recentActivity, observatorio] = await Promise.all([
        getTrendingTracks(8),
        getRecentActivity(8),
        getLandingObservatory(10),
    ])

    // monta o feed do ticker a partir da atividade real (duplicado p/ loop perfeito)
    const tickerBase = recentActivity.map((t) => ({
        who: t.profiles?.display_name || t.profiles?.username || 'Alguém',
        username: t.profiles?.username ?? null,
        track: t.track_title,
        artist: t.artist_name,
        href: trackHref(t.track_uri),
        ago: tic0(t.claimedat),
    }))
    const tickerItems =
        tickerBase.length > 0 ? [...tickerBase, ...tickerBase] : []

    // o selo da faixa em alta serve de amostra real do produto na seção "como funciona"
    const seloTrack = trendingTracks[0]
    const seloSrc = seloTrack
        ? '/api/og/selo?' +
          new URLSearchParams({
              title: seloTrack.track_title,
              artist: seloTrack.artist_name,
              cover: seloTrack.track_thumbnail || '',
              total: String(seloTrack.total_claims ?? 0),
              year: seloTrack.year || '',
          }).toString()
        : null

    return (
        <div className="mir-landing">
            {/* a foto do hero é o LCP e entra por CSS, então precisa do preload */}
            <link rel="preload" as="image" href={HERO_PHOTO} />

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
                        {/* Eram só âncoras para dentro da própria página. Agora
                            que o conteúdo abriu, a nav leva às páginas reais —
                            e é por ela que o crawler encontra o resto do site. */}
                        <div className="links">
                            <Link href="/feed">Achados</Link>
                            <Link href="/pilha">A pilha</Link>
                            <a href="#como">Como funciona</a>
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
                    <h1>
                        mir? sui<span className="dot">.</span>
                    </h1>
                    <p className="hero-sub">
                        Salve a música <em>antes dela estourar</em>. Fica
                        registrado que a descoberta foi sua.
                    </p>
                    <div className="hero-cta">
                        <AuthModalTrigger className="b b-acc" mode="signup">
                            Criar conta grátis <ArrowIcon size={16} />
                        </AuthModalTrigger>
                        <AuthModalTrigger className="b b-light" mode="login">
                            Entrar
                        </AuthModalTrigger>
                    </div>
                </div>

                {/* ticker ao vivo */}
                {tickerItems.length > 0 && (
                    <div className="ticker">
                        <div className="ticker-lead" aria-hidden="true">
                            <span className="live-dot" /> ao vivo
                        </div>
                        {/* A lista é duplicada para o loop da animação, então a
                            segunda metade sai de árvore de acessibilidade e de
                            tabulação — senão o leitor de tela ouve tudo duas
                            vezes e o tab passa por links repetidos. */}
                        <div className="ticker-track">
                            {tickerItems.map((it, i) => {
                                const eco = i >= tickerBase.length
                                return (
                                    <span
                                        className="ti"
                                        key={i}
                                        aria-hidden={eco || undefined}
                                    >
                                        <span className="early-dot" />
                                        {/* o texto vai num item só: .ti é
                                            inline-flex com gap, e soltar a
                                            vírgula como filho direto criaria um
                                            espaço antes dela */}
                                        <span className="ti-txt">
                                            {it.username ? (
                                                <Link
                                                    href={`/user/${it.username}`}
                                                    tabIndex={eco ? -1 : undefined}
                                                >
                                                    <b>{it.who}</b>
                                                </Link>
                                            ) : (
                                                <b>{it.who}</b>
                                            )}{' '}
                                            salvou{' '}
                                            <Link
                                                href={it.href}
                                                className="tk"
                                                tabIndex={eco ? -1 : undefined}
                                            >
                                                {it.track}
                                            </Link>
                                            , {it.artist}
                                        </span>
                                        <span className="ago">· {it.ago}</span>
                                    </span>
                                )
                            })}
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
                                <h2>O que tá sendo salvo agora.</h2>
                                <p className="sh-sub">
                                    Ainda dá tempo de salvar antes de virar
                                    tendência.
                                </p>
                            </div>
                            <Link href="/feed" className="b b-solid">
                                Explorar tudo <ArrowIcon size={15} />
                            </Link>
                        </div>

                        <TrackWall>
                            {trendingTracks.map((t, i) => (
                                // Era AuthModalTrigger: a capa mostrava uma faixa
                                // real e o clique abria login. Agora que a ficha
                                // é pública, o card leva até ela.
                                <Link
                                    href={trackHref(t.track_url)}
                                    className="poster"
                                    key={t.id}
                                    aria-label={`Abrir ${t.track_title}, de ${t.artist_name}`}
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
                                            {/* as iniciais ficam por baixo da capa:
                                                se a imagem falhar, o card não fica vazio */}
                                            <span
                                                className="mir-cover-ini"
                                                aria-hidden="true"
                                            >
                                                {initials(t.artist_name)}
                                            </span>
                                            {t.track_thumbnail && (
                                                <Image
                                                    src={t.track_thumbnail}
                                                    alt=""
                                                    width={240}
                                                    height={240}
                                                />
                                            )}
                                        </div>
                                        <span className="stamp">
                                            <StampIcon size={16} />
                                        </span>
                                    </div>
                                    <div className="ptt">{t.track_title}</div>
                                    <div className="par">{t.artist_name}</div>
                                    {/* o número é o total de salvamentos da faixa,
                                        não o da semana — o texto dizia "essa semana"
                                        e não batia com o dado */}
                                    <div className="padds">
                                        <TrendIcon size={12} />{' '}
                                        {t.total_claims === 1
                                            ? '1 já salvou'
                                            : `${t.total_claims} já salvaram`}
                                    </div>
                                </Link>
                            ))}
                        </TrackWall>
                    </div>
                </section>
            )}

            {/* ============ O OBSERVATÓRIO ============
                A seção acima é social: o que as pessoas daqui salvaram, hoje
                umas 30 faixas. Esta é o ativo próprio — o catálogo que o Mirsui
                mede sozinho, todo dia, sem depender de ninguém ter salvado.

                O título muda conforme o dado: enquanto não houver série longa o
                bastante para chamar de tendência, a lista é o subsolo do radar,
                e a seção diz isso. Quando o histórico encher, ela vira "as que
                mais subiram" sem ninguém tocar no código. */}
            {observatorio && observatorio.faixas.length > 0 && (
                <section className="wall-sec" id="observatorio">
                    <div className="wrap">
                        <div className="wall-head">
                            <div className="sec-head">
                                <span className="eyebrow">
                                    <span className="live-dot" /> O Observatório
                                </span>
                                <h2>
                                    {observatorio.temMovimento
                                        ? 'As que mais subiram desde que começamos a medir.'
                                        : 'O que ainda tá no subsolo.'}
                                </h2>
                                <p className="sh-sub">
                                    {observatorio.medidas.toLocaleString('pt-BR')}{' '}
                                    faixas medidas todo dia desde{' '}
                                    {/* o ponto final entra na expressão: solto na
                                        linha de baixo, o JSX vira a quebra em
                                        espaço e sai "10 de agosto ." */}
                                    {(observatorio.desde
                                        ? new Date(
                                              observatorio.desde + 'T12:00:00Z'
                                          ).toLocaleDateString('pt-BR', {
                                              day: 'numeric',
                                              month: 'long',
                                          })
                                        : 'o início') +
                                        '. Nenhuma plataforma publica esse histórico.'}
                                </p>
                            </div>
                            <Link href="/pilha" className="b b-solid">
                                Ver a pilha <ArrowIcon size={15} />
                            </Link>
                        </div>

                        <TrackWall>
                            {observatorio.faixas.map((f) => (
                                <Link
                                    href={`/track/${f.spotifyId}`}
                                    className="poster"
                                    key={f.spotifyId}
                                    aria-label={`Abrir ${f.title}, de ${f.artist}`}
                                >
                                    <div className="cover-wrap">
                                        <span className="rank-chip">
                                            {f.variacao != null
                                                ? `+${f.variacao
                                                      .toFixed(1)
                                                      .replace('.', ',')}%`
                                                : `${f.audiencia}/100`}
                                        </span>
                                        <div
                                            className="cover-art mir-cover"
                                            style={
                                                {
                                                    '--tone': tone(f.artist),
                                                } as React.CSSProperties
                                            }
                                        >
                                            <span
                                                className="mir-cover-ini"
                                                aria-hidden="true"
                                            >
                                                {initials(f.artist)}
                                            </span>
                                            {f.cover && (
                                                <Image
                                                    src={f.cover}
                                                    alt=""
                                                    width={240}
                                                    height={240}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="ptt">{f.title}</div>
                                    <div className="par">{f.artist}</div>
                                    <div className="padds">
                                        <TrendIcon size={12} />{' '}
                                        {f.genre ?? 'medida hoje'}
                                    </div>
                                </Link>
                            ))}
                        </TrackWall>
                    </div>
                </section>
            )}

            {/* ============ COMO FUNCIONA ============ */}
            <section className="como" id="como">
                <div className="wrap">
                    <div className="como-grid">
                        <div className="como-col">
                            <div className="sec-head">
                                <h2>Você ouve primeiro. A gente registra.</h2>
                                <p className="sh-sub">
                                    Salvar leva um clique. O que aquilo vale só
                                    aparece quando a faixa cresce.
                                </p>
                            </div>

                            <div className="como-beats">
                                {BEATS.map((b) => (
                                    <div className="como-beat" key={b.title}>
                                        <h3>{b.title}</h3>
                                        <p>{b.body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {seloSrc && (
                            <div className="como-selo-col">
                                <div className="como-selo">
                                    {/* passa pelo otimizador: o PNG cru do /api/og
                                        tem ~1 MB e aqui ele é exibido a ~300px */}
                                    <Image
                                        src={seloSrc}
                                        alt={`Selo de descoberta da faixa ${seloTrack!.track_title}, de ${seloTrack!.artist_name}`}
                                        width={324}
                                        height={576}
                                        sizes="(max-width: 980px) 280px, 312px"
                                    />
                                </div>
                                <p className="como-cap">
                                    O selo que você compartilha
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ============ MANIFESTO ============ */}
            <section className="manifesto wrap" id="manifesto">
                <p>
                    O algoritmo te entrega o que já bombou. O Mirsui guarda o que
                    você ouviu <em>antes</em>.
                </p>
                <div className="sig">Você vai entender daqui 6 meses</div>
            </section>

            {/* ============ CTA FINAL ============ */}
            <section className="endcta wrap">
                <h2>Entra e começa a cavar.</h2>
                <p>
                    Som novo todo dia. Salva o que você curtir e monta o
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
