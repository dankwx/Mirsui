"use client"

import SearchWithResults from '../SearchWithResults/SearchWithResults'
import { ChevronDown, LogOut, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

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

export default function Header({ userProfile }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)

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
        <header className="sticky top-0 z-40 border-b border-white/5 bg-white/[0.03] backdrop-blur-3xl">
            <div className="flex items-center justify-between px-10 py-5">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-white/40">
                        <Sparkles className="h-4 w-4 text-purple-300" />
                        <span>explorar catapultas sonoras</span>
                    </div>
                    <div className="relative w-[min(620px,60vw)]">
                        <SearchWithResults />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {userProfile && (
                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 shadow-[0_25px_60px_-30px_rgba(106,76,227,0.55)] transition-colors duration-200 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                            >
                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
                                    {userProfile?.avatar_url ? (
                                        <img
                                            src={userProfile.avatar_url}
                                            alt="User avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
                                            {getInitials(
                                                userProfile?.display_name,
                                                userProfile?.email
                                            )}
                                        </span>
                                    )}
                                </div>
                                <div className="hidden flex-col leading-tight text-left md:flex">
                                    <span className="text-sm font-medium text-white">
                                        {userProfile?.display_name ||
                                            userProfile?.username ||
                                            'Explorador'}
                                    </span>
                                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                                        {userProfile?.rating ? `score ${userProfile.rating}` : 'online'}
                                    </span>
                                </div>
                                <ChevronDown
                                    className={`hidden h-4 w-4 text-white/50 transition-transform duration-200 md:block ${
                                        isMenuOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 top-[calc(100%+12px)] min-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1021]/95 shadow-[0_30px_90px_-40px_rgba(80,56,204,0.85)] backdrop-blur-2xl">
                                    <div className="border-b border-white/5 px-4 py-3">
                                        <p className="text-sm font-semibold text-white">
                                            {userProfile?.display_name ||
                                                userProfile?.username ||
                                                'Explorador'}
                                        </p>
                                        <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                                            score{' '}
                                            {userProfile?.rating
                                                ? userProfile.rating
                                                : '—'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col p-2 text-sm text-white/70">
                                        <Link
                                            href={`/user/${userProfile?.username || userProfile?.id}`}
                                            className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-white/10"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Perfil
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-white/10"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Configurações
                                        </Link>
                                        <Link
                                            href="/logout"
                                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-red-200 transition-colors duration-200 hover:bg-red-300/10"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sair
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {!userProfile && (
                        <Link
                            href="/login"
                            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70 transition-colors duration-200 hover:bg-white/10"
                        >
                            entrar
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
