import GetAuth from '@/components/GetAuth/GetAuth'
import SearchWithResults from '../SearchWithResults/SearchWithResults'
import { Sparkles } from 'lucide-react'

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
                        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10 bg-gradient-to-r from-white/15 to-transparent blur" />
                        <div className="relative rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 shadow-[0_18px_50px_rgba(109,76,231,0.18)]">
                            <SearchWithResults />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {userProfile && (
                        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70 backdrop-blur-xl">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
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
                            <div className="hidden flex-col leading-tight md:flex">
                                <span className="text-white">
                                    {userProfile?.display_name ||
                                        userProfile?.username ||
                                        'Explorador'}
                                </span>
                                <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                                    {userProfile?.rating ? `score ${userProfile.rating}` : 'online'}
                                </span>
                            </div>
                        </div>
                    )}

                    <GetAuth />
                </div>
            </div>
        </header>
    )
}
