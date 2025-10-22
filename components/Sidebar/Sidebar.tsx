// components/Sidebar/Sidebar.tsx
'use client'

import Link from 'next/link'
import { Music, Home, Library, Disc, Lamp, Sparkles } from 'lucide-react'

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
        <aside className="h-screen w-64 border-r border-white/20 bg-white/70 backdrop-blur-2xl shadow-xl shadow-black/5">
            <div className="flex flex-col h-full">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                            <Music className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">Sound Sage</span>
                            <p className="text-xs text-slate-600">Music Discovery</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-3">
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Navigation</p>
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-white/60 hover:backdrop-blur-xl hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:text-purple-700 hover:scale-[1.02]"
                                >
                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-300 group-hover:shadow-md">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">{item.title}</span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                <div className="p-4 border-t border-white/30 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-md shadow-lg hover:shadow-xl hover:bg-white/80 transition-all duration-300 cursor-pointer group">
                        {userProfile?.avatar_url ? (
                            <img
                                src={userProfile.avatar_url}
                                alt="User avatar"
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-white/50 group-hover:ring-purple-500/50 transition-all duration-300"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                                {getInitials(
                                    userProfile?.display_name,
                                    userProfile?.email
                                )}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                                {userProfile?.display_name ||
                                    userProfile?.username ||
                                    'User'}
                            </p>
                            <p className="text-xs text-slate-600 truncate">
                                {userProfile?.email || 'Not logged in'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
