'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowUpRight, Gauge, LogOut, UserRound } from 'lucide-react'
import SearchWithResults from '@/components/SearchWithResults/SearchWithResults'
import AuthModalTrigger from '@/components/AuthModalTrigger/AuthModalTrigger'
import FotoDePerfil from '@/components/FotoDePerfil'
import MirsuiLogo from '@/components/MirsuiLogo/MirsuiLogo'
import { signOut } from '@/app/auth/actions'
import { navLinks, navLinksVisitante } from '@/components/Header/navLinks'
import type { SessionUserProfile } from '@/lib/sessionProfile'
import ThemeToggle from './ThemeToggle'
import styles from './ClubHeader.module.css'

export default function ClubHeader({
    userProfile,
    isDono = false,
}: {
    userProfile?: SessionUserProfile | null
    isDono?: boolean
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSigningOut, startSignOut] = useTransition()
    const profileRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()
    const router = useRouter()
    const homeUrl = userProfile ? '/feed' : '/'

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

        if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isMenuOpen])

    const initials = (userProfile?.display_name || userProfile?.username || 'Explorador')
        .trim()
        .slice(0, 2)
        .toUpperCase()

    return (
        <header className={styles.header}>
            <nav className={styles.nav} aria-label="Navegação principal">
                <Link
                    href={homeUrl}
                    className={styles.wordmark}
                    aria-label="Mirsui, início"
                >
                    <MirsuiLogo
                        size={24}
                        ink="currentColor"
                        acc="var(--club-accent)"
                    />
                    mirsui
                </Link>

                <div className={styles.navLinks}>
                    {(userProfile ? navLinks : navLinksVisitante).map((link) => {
                        const active = link.match(pathname)
                        const href = link.title === 'Início' ? homeUrl : link.url
                        return (
                            <Link
                                key={link.title}
                                href={href}
                                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                            >
                                {link.title}
                            </Link>
                        )
                    })}
                </div>

                <div className={styles.actions}>
                    <div className={styles.search}>
                        <SearchWithResults className="club-search" />
                    </div>
                    <ThemeToggle className={styles.themeToggle} />

                    {userProfile ? (
                        <div className={styles.profile} ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen((open) => !open)}
                                aria-label="Menu do perfil"
                                aria-expanded={isMenuOpen}
                                className={styles.avatarButton}
                            >
                                <FotoDePerfil
                                    src={userProfile.avatar_url}
                                    className={styles.avatarImage}
                                >
                                    <span className={styles.avatarFallback}>
                                        {initials}
                                    </span>
                                </FotoDePerfil>
                            </button>

                            {isMenuOpen && (
                                <div className={styles.menu}>
                                    <div className={styles.menuHeader}>
                                        <p>
                                            {userProfile.display_name ||
                                                userProfile.username ||
                                                'Explorador'}
                                        </p>
                                        {userProfile.username && (
                                            <span>@{userProfile.username}</span>
                                        )}
                                    </div>
                                    <div className={styles.menuItems}>
                                        <Link
                                            href={`/user/${userProfile.username || userProfile.id}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <UserRound aria-hidden="true" />
                                            Perfil
                                        </Link>
                                        {isDono && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <Gauge aria-hidden="true" />
                                                Painel
                                            </Link>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleSignOut}
                                            disabled={isSigningOut}
                                        >
                                            <LogOut aria-hidden="true" />
                                            {isSigningOut ? 'Saindo...' : 'Sair'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <AuthModalTrigger mode="login" className={styles.login}>
                                Entrar
                            </AuthModalTrigger>
                            <AuthModalTrigger
                                mode="signup"
                                className={styles.signup}
                            >
                                Fazer parte <ArrowUpRight size={15} aria-hidden="true" />
                            </AuthModalTrigger>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}
