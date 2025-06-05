// components/Sidebar/Sidebar.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Music, Tv, Video, Mic, Menu, X, Home, Library } from 'lucide-react'

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
        title: 'Claim Channel',
        url: '/claimchannel',
        icon: Tv,
    },
    {
        title: 'Claim Video',
        url: '/claimvideo',
        icon: Video,
    },
    {
        title: 'Claim Track',
        url: '/claimtrack',
        icon: Music,
    },
    {
        title: 'Claim Artist',
        url: '/claimartist',
        icon: Mic,
    },
]

export default function Sidebar({ userProfile }: SidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true)

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

    return (
        <aside
            className={`flex h-screen shrink-0 flex-col border-r border-border bg-[#fafafa] transition-all duration-300 ease-in-out ${
                isExpanded ? 'w-64' : 'w-16'
            }`}
        >
            {/* Header */}
            <div className="p-4">
                {isExpanded ? (
                    // Layout quando expandido - logo + nome + botão
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                                <Music className="h-4 w-4 text-white" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold text-foreground">
                                    Sound Sage
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    Music Discovery
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent"
                            aria-label="Collapse sidebar"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                ) : (
                    // Layout quando contraído - só o logo centralizado
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                            <Music className="h-4 w-4 text-white" />
                        </div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-accent"
                            aria-label="Expand sidebar"
                        >
                            <Menu className="h-3 w-3 text-muted-foreground" />
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3">
                <div className="mb-2">
                    {isExpanded && (
                        <h4 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
                            NAVIGATION
                        </h4>
                    )}
                    <nav className="space-y-1">
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {isExpanded && (
                                        <span className="truncate">
                                            {item.title}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Footer - só aparece quando expandido */}
            {isExpanded && (
                <div className="mt-auto p-3">
                    <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent">
                        {/* Avatar do usuário */}
                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
                            {userProfile?.avatar_url ? (
                                <img
                                    src={userProfile.avatar_url}
                                    alt="User avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-semibold text-white">
                                    {getInitials(
                                        userProfile?.display_name,
                                        userProfile?.email
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold text-foreground">
                                {userProfile?.display_name ||
                                    userProfile?.username ||
                                    'User'}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                {userProfile?.email || 'Not logged in'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}
