// components/Sidebar/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Library, Disc, Lamp, Music, Sparkles } from 'lucide-react'

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

interface SidebarProps {
    userProfile: UserProfile | null
}

const navigationItems = [
    {
        title: 'Home',
        url: '/',
        icon: Home,
    },
    { title: 'My Library', url: '/library', icon: Library },
    {
        title: 'Discover', url: '/discover', icon: Lamp
    },
    {
        title: 'Music Prophet',
        url: '/prophet',
        icon: Sparkles,
    },
    {
        title: 'Claim Track',
        url: '/claimtrack',
        icon: Disc,
    },
]

export default function Sidebar({ userProfile }: SidebarProps) {
    const pathname = usePathname()

    // Função para gerar iniciais do nome ou email
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

    const isActive = (url: string) => {
        if (url === '/') {
            return pathname === '/'
        }
        return pathname.startsWith(url)
    }

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col border-r border-white/5 bg-[#070316]/95 backdrop-blur-3xl">
            <div className="pointer-events-none absolute inset-x-0 bottom-24 h-40 bg-[radial-gradient(circle_at_center,_rgba(153,102,255,0.18),_transparent_70%)]" />
            <div className="relative flex flex-1 flex-col overflow-y-auto">
                <div className="px-6 pb-8 pt-10">
                    <Link
                        href="/"
                        className="group flex items-center gap-4"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-500 text-white shadow-[0_20px_45px_rgba(128,90,213,0.45)] transition-transform duration-300 group-hover:scale-110">
                            <Music className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-semibold tracking-tight text-white">
                                Mirsui
                            </span>
                            <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-white/40">
                                Audio futures
                            </p>
                        </div>
                    </Link>
                </div>

                <nav className="relative flex-1 px-5">
                    <div className="mb-6 flex flex-col gap-2 text-[11px] uppercase tracking-[0.35em] text-white/35">
                        <span className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-white/40" />
                            Navegação
                        </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.url)
                            return (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    className={`group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition-all duration-200 ${
                                        active
                                            ? 'border-white/15 bg-white/[0.12] text-white shadow-[0_12px_40px_rgba(137,97,255,0.25)]'
                                            : 'border-transparent text-white/65 hover:border-white/10 hover:bg-white/[0.06] hover:text-white'
                                    }`}
                                >
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] transition ${
                                        active
                                            ? 'text-white'
                                            : 'text-white/50 group-hover:text-white'
                                    }`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium tracking-tight">{item.title}</span>
                                        {active && (
                                            <span className="text-xs uppercase tracking-[0.3em] text-white/40">
                                                Agora
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                <div className="relative border-t border-white/5 p-5">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-2xl transition hover:border-white/25 hover:bg-white/[0.08]">
                        {userProfile?.avatar_url ? (
                            <img
                                src={userProfile.avatar_url}
                                alt="User avatar"
                                className="h-11 w-11 rounded-2xl object-cover"
                            />
                        ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 text-sm font-semibold text-white">
                                {getInitials(
                                    userProfile?.display_name,
                                    userProfile?.email
                                )}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                                {userProfile?.display_name ||
                                    userProfile?.username ||
                                    'User'}
                            </p>
                            <p className="truncate text-xs text-white/50">
                                {userProfile?.email || 'Not logged in'}
                            </p>
                        </div>
                        <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/65">
                            Perfil
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
