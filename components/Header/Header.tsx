"use client"

import SearchWithResults from '../SearchWithResults/SearchWithResults'
import MirsuiLogo from '../MirsuiLogo/MirsuiLogo'
import LoginModal from '../ModalLogin/ModalLogin'
import { LogOut, Settings, UserRound } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/app/auth/actions'

// Tipo para o perfil do usuário
interface UserProfile {
    id?: string
    email?: string
    username?: string
    description?: string
    display_name?: string
    avatar_url?: string
    rating?: number
}

interface HeaderProps {
    userProfile?: UserProfile | null
}

type NavLink = {
    title: string
    url: string
    match: (pathname: string) => boolean
}

const navLinks: NavLink[] = [
    {
        title: 'Início',
        url: '/',
        match: (p) => p === '/' || p.startsWith('/feed'),
    },
    {
        title: 'Acervo',
        url: '/library',
        match: (p) => p.startsWith('/library') || p.startsWith('/user'),
    },
    {
        title: 'Claim',
        url: '/claimtrack',
        match: (p) => p.startsWith('/claimtrack'),
    },
]

export default function Header({ userProfile }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()
    const router = useRouter()
    const [isSigningOut, startSignOut] = useTransition()

    const handleSignOut = () => {
        setIsMenuOpen(false)
        startSignOut(async () => {
            try {
                await signOut()
            } catch (error) {
                console.error('Erro ao encerrar sessão', error)
                router.push('/')
                router.refresh()
            }
        })
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false)
            }
        }

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [isMenuOpen])

    return (
        <header className="sticky top-0 z-40 border-b border-mir-line bg-mir-bg/85 backdrop-blur-xl">
            <nav className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center gap-7 px-5 sm:px-10">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 text-2xl font-black tracking-[-0.04em] text-mir-text"
                >
                    <MirsuiLogo size={30} />
                    mirsui
                </Link>

                <div className="hidden items-center gap-7 md:flex">
                    {navLinks.map((link) => {
                        const active = link.match(pathname)
                        return (
                            <Link
                                key={link.title}
                                href={link.url}
                                className={`relative text-[15px] font-semibold transition-colors ${
                                    active
                                        ? "text-mir-text after:absolute after:-bottom-[3px] after:left-0 after:h-[2px] after:w-full after:bg-mir-acc after:content-['']"
                                        : 'text-mir-text2 hover:text-mir-text'
                                }`}
                            >
                                {link.title}
                            </Link>
                        )
                    })}
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <div className="hidden w-[290px] lg:block">
                        <SearchWithResults />
                    </div>

                    {userProfile ? (
                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Menu do perfil"
                                className="block h-[38px] w-[38px] overflow-hidden rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mir-acc/60"
                                style={{
                                    background: userProfile?.avatar_url
                                        ? '#16120c'
                                        : 'radial-gradient(130% 130% at 32% 24%,#f3ecdb 0%,#cdef36 22%,#c14a26 54%,#16120c 88%)',
                                    boxShadow: '0 0 0 1.5px rgba(236,227,210,0.18)',
                                }}
                            >
                                {userProfile?.avatar_url && (
                                    <img
                                        src={userProfile.avatar_url}
                                        alt="User avatar"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                )}
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 top-[calc(100%+10px)] min-w-[210px] overflow-hidden rounded-xl border border-mir-line bg-mir-surface shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
                                    <div className="border-b border-mir-line px-4 py-3">
                                        <p className="text-sm font-bold text-mir-text">
                                            {userProfile?.display_name ||
                                                userProfile?.username ||
                                                'Explorador'}
                                        </p>
                                        {userProfile?.username && (
                                            <p className="font-mono text-[11px] text-mir-text3">
                                                @{userProfile.username}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col p-1.5 text-sm text-mir-text2">
                                        <Link
                                            href={`/user/${userProfile?.username || userProfile?.id}`}
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-mir-fill2 hover:text-mir-text"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <UserRound className="h-4 w-4" />
                                            Perfil
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-mir-fill2 hover:text-mir-text"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Settings className="h-4 w-4" />
                                            Configurações
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleSignOut}
                                            disabled={isSigningOut}
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-red-300/80 transition-colors hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {isSigningOut ? 'Saindo...' : 'Sair'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <LoginModal
                            defaultMode="login"
                            trigger={
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-lg bg-mir-acc px-4 py-2 text-sm font-semibold text-mir-on-acc transition hover:brightness-110"
                                >
                                    Entrar
                                </button>
                            }
                        />
                    )}
                </div>
            </nav>
        </header>
    )
}
