import Link from 'next/link'
import MirsuiLogo from '../MirsuiLogo/MirsuiLogo'

interface ProfileFooterProps {
    profileNo: string
    memberSince: number
}

const LINKS = [
    { label: 'FARO', href: '/prophet' },
    { label: 'CLAIM', href: '/claimtrack' },
    { label: 'TERMOS', href: '#' },
    { label: 'PRIVACIDADE', href: '#' },
]

export default function ProfileFooter({ profileNo, memberSince }: ProfileFooterProps) {
    return (
        <footer className="w-full border-t-2 border-[#cdef36] bg-[#16120c]">
            <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-5 px-5 py-12 sm:px-8">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 text-[20px] font-extrabold tracking-[-0.04em] text-[#ece3d2]"
                >
                    <MirsuiLogo size={26} />
                    mirsui
                </Link>

                <div className="text-center font-mono text-[11px] leading-[1.6] tracking-[0.1em] text-[#ece3d2]/40">
                    ARQUIVO MUSICAL CURATORIAL · Nº {profileNo} · DESDE {memberSince}
                    <br />
                    feito por quem ouve cedo demais.
                </div>

                <div className="flex gap-[18px] font-mono text-[11px] tracking-[0.1em] text-[#ece3d2]/55">
                    {LINKS.map((l) => (
                        <Link
                            key={l.label}
                            href={l.href}
                            className="transition-colors hover:text-[#cdef36]"
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    )
}
