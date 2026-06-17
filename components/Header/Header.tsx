"use client"

import SearchWithResults from '../SearchWithResults/SearchWithResults'
import MirsuiLogo from '../MirsuiLogo/MirsuiLogo'
import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
        title: 'Descobrir',
        url: '/discover',
        match: (p) => p.startsWith('/discover'),
    },
    {
        title: 'Prophet',
        url: '/prophet',
        match: (p) => p.split('/').includes('prophet'),
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

    const getInitials = (
        name: string | undefined,
        email: string | undefined
    ) => {
        if (name) {
            return name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        if (email) {
            return email[0].toUpperCase()
        }
        return 'U'
    }

    return (
        <header className="sticky top-0 z-40 border-b border-mir-line bg-mir-bg/85 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-6 px-5 sm:px-10">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-mir-text"
                >
                    <MirsuiLogo size={34} />
                    Mirsui
                </Link>

                <div className="hidden items-center gap-6 md:flex">
                    {navLinks.map((link) => {
                        const active = link.match(pathname)
                        return (
                            <Link
                                key={link.title}
                                href={link.url}
                                className={`text-[13.5px] font-semibold transition-colors ${
                                    active
                                        ? 'text-mir-text'
                                        : 'text-mir-text2 hover:text-mir-text'
                                }`}
                            >
                                {link.title}
                            </Link>
                        )
                    })}
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <div className="hidden w-[260px] lg:block">
                        <SearchWithResults />
                    </div>

                    {userProfile ? (
                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="group flex items-center gap-2 rounded-full border border-mir-line bg-mir-fill1 py-1 pl-1 pr-2.5 transition-colors hover:border-mir-line2 hover:bg-mir-fill2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mir-acc/60"
                            >
                                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-mir-card">
                                    {userProfile?.avatar_url ? (
                                        <img
                                            src={userProfile.avatar_url}
                                            alt="User avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-[11px] font-bold text-mir-text">
                                            {getInitials(
                                                userProfile?.display_name,
                                                userProfile?.email
                                            )}
                                        </span>
                                    )}
                                </div>
                                <ChevronDown
                                    className={`h-3.5 w-3.5 text-mir-text3 transition-transform duration-200 ${
                                        isMenuOpen ? 'rotate-180' : ''
                                    }`}
                                />
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
                                        <Link
                                            href="/logout"
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-red-300/80 transition-colors hover:bg-red-400/10 hover:text-red-300"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sair
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex items-center rounded-lg bg-mir-acc px-4 py-2 text-[13px] font-semibold text-mir-on-acc transition hover:brightness-110"
                        >
                            Entrar
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    )
}
