import Link from 'next/link'

function Glyph({ size = 20 }: { size?: number }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <circle
                cx="12"
                cy="12"
                r="9.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            />
            <circle cx="12" cy="12" r="3" fill="#cdef36" />
        </svg>
    )
}

const cols = [
    { h: 'Plataforma', links: ['A cena', 'Acervo'] },
    { h: 'Mirsui', links: ['Sobre', 'Privacidade', 'Contato'] },
]

export default function Footer() {
    return (
        <footer className="border-t border-mir-line bg-mir-surface py-12 text-mir-text">
            <div className="mx-auto w-full max-w-[1180px] px-[clamp(20px,5vw,56px)]">
                <div className="flex flex-wrap justify-between gap-12">
                    <div className="max-w-[32ch]">
                        <div className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-mir-text">
                            <Glyph size={20} /> Mirsui
                        </div>
                        <p className="mt-3.5 text-[13px] leading-relaxed text-mir-text3">
                            Acervo coletivo de descoberta musical. Para quem ouve
                            primeiro e tem como provar.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-[clamp(36px,6vw,72px)]">
                        {cols.map((c) => (
                            <div key={c.h}>
                                <h5 className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-mir-text3">
                                    {c.h}
                                </h5>
                                {c.links.map((l) => (
                                    <Link
                                        key={l}
                                        href="#"
                                        className="mb-2.5 block text-[13.5px] text-mir-text2 transition-colors hover:text-mir-text"
                                    >
                                        {l}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-11 flex flex-wrap items-center justify-between gap-3.5 border-t border-mir-line pt-5 font-mono text-[11.5px] text-mir-text3">
                    <span>© 2026 Mirsui · Rio de Janeiro</span>
                    <div className="flex gap-3.5">
                        {['Instagram', 'X', 'GitHub'].map((s) => (
                            <Link
                                key={s}
                                href="#"
                                className="text-mir-text3 transition-colors hover:text-mir-text"
                            >
                                {s}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
