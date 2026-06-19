import Link from 'next/link'
import MirsuiLogo from '../MirsuiLogo/MirsuiLogo'

const ARCHIVO = 'var(--font-archivo), system-ui, sans-serif'
const MONO = 'var(--font-space-mono), ui-monospace, monospace'

export interface LegalSection {
    id: string
    num: string
    title: string
    paras: string[]
    items?: string[]
}

export interface LegalPromise {
    tag: string
    title: string
    desc: string
}

export interface LegalDocProps {
    /** Texto repetido no ticker do topo */
    tickerText: string
    /** Selo do hero, ex.: "DOCUMENTO LEGAL · 01 DE 02" */
    docIndex: string
    /** Botão do masthead que aponta pro outro documento */
    crossLabel: string
    crossHref: string
    /** Título do hero (pode conter <br />) */
    title: React.ReactNode
    intro: string
    badges: string[]
    /** Faixa de promessas (só na Privacidade) */
    promises?: LegalPromise[]
    sections: LegalSection[]
    contact: {
        eyebrow: string
        title: string
        desc: string
        email: string
    }
}

export default function LegalDoc({
    tickerText,
    docIndex,
    crossLabel,
    crossHref,
    title,
    intro,
    badges,
    promises,
    sections,
    contact,
}: LegalDocProps) {
    const tickerSpan = (
        <span
            style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.14em',
                padding: '7px 0',
            }}
        >
            {tickerText}
        </span>
    )

    return (
        <div
            style={{
                background: '#16120c',
                fontFamily: ARCHIVO,
                color: '#ece3d2',
                minHeight: '100vh',
                width: '100%',
                overflowX: 'hidden',
                WebkitFontSmoothing: 'antialiased',
            }}
        >
            {/* TICKER */}
            <div
                style={{
                    background: '#cdef36',
                    color: '#16120c',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    borderBottom: '2px solid #16120c',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        animation: 'mir-ticker 38s linear infinite',
                        willChange: 'transform',
                    }}
                >
                    {tickerSpan}
                    {tickerSpan}
                </div>
            </div>

            {/* MASTHEAD */}
            <header
                style={{
                    borderBottom: '1px solid rgba(236,227,210,.12)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    background: 'rgba(22,18,12,.82)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div
                    style={{
                        maxWidth: 1100,
                        margin: '0 auto',
                        padding: '15px 32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 36,
                    }}
                >
                    <Link
                        href="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 11,
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        <MirsuiLogo size={30} />
                        <span
                            style={{
                                fontWeight: 900,
                                fontSize: 24,
                                letterSpacing: '-.04em',
                            }}
                        >
                            mirsui
                        </span>
                    </Link>
                    <div style={{ flex: 1 }} />
                    <Link
                        href={crossHref}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: '#ece3d2',
                            textDecoration: 'none',
                            fontFamily: MONO,
                            fontSize: 11,
                            letterSpacing: '.1em',
                            border: '1px solid rgba(236,227,210,.22)',
                            borderRadius: 999,
                            padding: '9px 16px',
                        }}
                    >
                        {crossLabel}
                    </Link>
                </div>
            </header>

            {/* HERO */}
            <section style={{ borderBottom: '1px solid rgba(236,227,210,.1)' }}>
                <div
                    style={{
                        maxWidth: 1100,
                        margin: '0 auto',
                        padding: '64px 32px 44px',
                    }}
                >
                    <div
                        style={{
                            fontFamily: MONO,
                            fontSize: 11,
                            letterSpacing: '.2em',
                            color: '#cdef36',
                            marginBottom: 18,
                        }}
                    >
                        ★ {docIndex}
                    </div>
                    <h1
                        style={{
                            fontWeight: 900,
                            fontSize: 'clamp(56px,9vw,116px)',
                            lineHeight: '.84',
                            letterSpacing: '-.055em',
                            margin: '0 0 22px',
                        }}
                    >
                        {title}
                    </h1>
                    <p
                        style={{
                            fontSize: 18,
                            lineHeight: 1.5,
                            maxWidth: 580,
                            color: 'rgba(236,227,210,.74)',
                            margin: '0 0 24px',
                        }}
                    >
                        {intro}
                    </p>
                    <div
                        style={{
                            display: 'flex',
                            gap: 10,
                            flexWrap: 'wrap',
                            fontFamily: MONO,
                            fontSize: 11,
                            letterSpacing: '.08em',
                        }}
                    >
                        {badges.map((b, i) => (
                            <span
                                key={i}
                                style={{
                                    background:
                                        i === badges.length - 1
                                            ? 'rgba(205,239,54,.1)'
                                            : 'rgba(236,227,210,.07)',
                                    border:
                                        i === badges.length - 1
                                            ? '1px solid rgba(205,239,54,.32)'
                                            : '1px solid rgba(236,227,210,.14)',
                                    borderRadius: 999,
                                    padding: '7px 14px',
                                    color:
                                        i === badges.length - 1
                                            ? '#cdef36'
                                            : 'rgba(236,227,210,.66)',
                                }}
                            >
                                {b}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROMISE STRIP */}
            {promises && promises.length > 0 && (
                <section style={{ background: '#ece3d2', color: '#16120c' }}>
                    <div
                        style={{
                            maxWidth: 1100,
                            margin: '0 auto',
                            padding: '34px 32px',
                        }}
                    >
                        <div className="mir-legal-promises">
                            {promises.map((pr) => (
                                <div
                                    key={pr.tag}
                                    style={{
                                        display: 'flex',
                                        gap: 14,
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: MONO,
                                            fontWeight: 700,
                                            fontSize: 13,
                                            color: '#c14a26',
                                            flex: 'none',
                                            paddingTop: 2,
                                        }}
                                    >
                                        {pr.tag}
                                    </span>
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: 800,
                                                fontSize: 16,
                                                letterSpacing: '-.02em',
                                                marginBottom: 4,
                                            }}
                                        >
                                            {pr.title}
                                        </div>
                                        <p
                                            style={{
                                                fontFamily: MONO,
                                                fontSize: 11.5,
                                                lineHeight: 1.55,
                                                color: 'rgba(22,18,12,.62)',
                                                margin: 0,
                                            }}
                                        >
                                            {pr.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* BODY */}
            <section>
                <div className="mir-legal-body">
                    {/* TOC */}
                    <aside
                        className="mir-legal-toc"
                        style={{ position: 'sticky', top: 90, paddingTop: 48 }}
                    >
                        <div
                            style={{
                                fontFamily: MONO,
                                fontSize: 10,
                                letterSpacing: '.18em',
                                color: 'rgba(236,227,210,.4)',
                                marginBottom: 16,
                            }}
                        >
                            NESTE DOCUMENTO
                        </div>
                        <nav
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            {sections.map((s) => (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    style={{
                                        display: 'flex',
                                        gap: 10,
                                        textDecoration: 'none',
                                        color: 'rgba(236,227,210,.62)',
                                        fontSize: 13.5,
                                        fontWeight: 600,
                                        padding: '7px 0',
                                        borderBottom:
                                            '1px solid rgba(236,227,210,.07)',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: MONO,
                                            fontSize: 11,
                                            color: '#cdef36',
                                            flex: 'none',
                                        }}
                                    >
                                        {s.num}
                                    </span>
                                    <span>{s.title}</span>
                                </a>
                            ))}
                        </nav>
                    </aside>

                    {/* ARTICLES */}
                    <div style={{ paddingTop: 48, minWidth: 0 }}>
                        {sections.map((s) => (
                            <article
                                key={s.id}
                                id={s.id}
                                style={{
                                    paddingBottom: 42,
                                    marginBottom: 42,
                                    borderBottom: '1px solid rgba(236,227,210,.09)',
                                    scrollMarginTop: 90,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: 16,
                                        marginBottom: 18,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: MONO,
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: '#cdef36',
                                            flex: 'none',
                                        }}
                                    >
                                        {s.num}
                                    </span>
                                    <h2
                                        style={{
                                            fontWeight: 800,
                                            fontSize: 'clamp(24px,3vw,32px)',
                                            letterSpacing: '-.03em',
                                            lineHeight: 1.04,
                                            margin: 0,
                                        }}
                                    >
                                        {s.title}
                                    </h2>
                                </div>
                                <div style={{ paddingLeft: 38 }}>
                                    {s.paras.map((p, i) => (
                                        <p
                                            key={i}
                                            style={{
                                                fontSize: 16,
                                                lineHeight: 1.66,
                                                color: 'rgba(236,227,210,.78)',
                                                margin: '0 0 14px',
                                                textWrap: 'pretty',
                                            }}
                                        >
                                            {p}
                                        </p>
                                    ))}
                                    {s.items && s.items.length > 0 && (
                                        <ul
                                            style={{
                                                margin: '6px 0 0',
                                                padding: 0,
                                                listStyle: 'none',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 10,
                                            }}
                                        >
                                            {s.items.map((it, i) => (
                                                <li
                                                    key={i}
                                                    style={{
                                                        display: 'flex',
                                                        gap: 12,
                                                        fontSize: 15,
                                                        lineHeight: 1.55,
                                                        color: 'rgba(236,227,210,.74)',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: '#cdef36',
                                                            flex: 'none',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        →
                                                    </span>
                                                    <span>{it}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </article>
                        ))}

                        {/* CONTACT CARD */}
                        <div
                            style={{
                                background: '#ece3d2',
                                color: '#16120c',
                                borderRadius: 16,
                                padding: '34px 32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 20,
                            }}
                        >
                            <div style={{ maxWidth: 440 }}>
                                <div
                                    style={{
                                        fontFamily: MONO,
                                        fontSize: 11,
                                        letterSpacing: '.16em',
                                        color: '#c14a26',
                                        marginBottom: 10,
                                    }}
                                >
                                    ★ {contact.eyebrow}
                                </div>
                                <h3
                                    style={{
                                        fontWeight: 900,
                                        fontSize: 26,
                                        letterSpacing: '-.03em',
                                        margin: '0 0 8px',
                                        lineHeight: 1.05,
                                    }}
                                >
                                    {contact.title}
                                </h3>
                                <p
                                    style={{
                                        fontFamily: MONO,
                                        fontSize: 12,
                                        lineHeight: 1.6,
                                        color: 'rgba(22,18,12,.64)',
                                        margin: 0,
                                    }}
                                >
                                    {contact.desc}
                                </p>
                            </div>
                            <a
                                href={`mailto:${contact.email}`}
                                style={{
                                    flex: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    background: '#16120c',
                                    color: '#cdef36',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: 15,
                                    padding: '15px 26px',
                                    borderRadius: 999,
                                }}
                            >
                                {contact.email} →
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
