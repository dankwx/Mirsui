import GetAuth from '@/components/GetAuth/GetAuth'
import SearchWithResults from '../SearchWithResults/SearchWithResults'

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
        <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-2xl px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <SearchWithResults />
                </div>

                <div className="flex items-center gap-3">
                    {/* Você pode usar userProfile aqui também se quiser customizar o GetAuth */}
                    {userProfile && (
                        <div className="group flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-card/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer ring-2 ring-border hover:ring-accent/50">
                            {userProfile?.avatar_url ? (
                                <img
                                    src={userProfile.avatar_url}
                                    alt="User avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-tertiary to-tertiary-hover text-xs font-bold text-tertiary-foreground">
                                    {getInitials(
                                        userProfile?.display_name,
                                        userProfile?.email
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <GetAuth />
                </div>
            </div>
        </header>
    )
}
