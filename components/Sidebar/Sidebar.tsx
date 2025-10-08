// components/Sidebar/Sidebar.tsx
'use client'

import Link from 'next/link'
import { Music, Home, Library, Disc, Lamp } from 'lucide-react'

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
        title: 'Claim Track',
        url: '/claimtrack',
        icon: Disc,
    },
]

export default function Sidebar({ userProfile }: SidebarProps) {
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
        <aside className="h-screen w-64 border-r border-border bg-card">
            <div className="flex flex-col h-full">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Music className="h-8 w-8 text-accent" />
                        <span className="text-xl font-semibold text-foreground">Sound Sage</span>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">Music Discovery</p>
                </div>

                <nav className="flex-1 px-3">
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Navigation</p>
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        {userProfile?.avatar_url ? (
                            <img
                                src={userProfile.avatar_url}
                                alt="User avatar"
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                {getInitials(
                                    userProfile?.display_name,
                                    userProfile?.email
                                )}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {userProfile?.display_name ||
                                    userProfile?.username ||
                                    'User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {userProfile?.email || 'Not logged in'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
