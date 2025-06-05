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
        <header className="border-b border-border bg-background px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <SearchWithResults />
                </div>

                <div className="flex items-center gap-4">
                    {/* Você pode usar userProfile aqui também se quiser customizar o GetAuth */}
                    {userProfile && (
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
                    )}

                    <GetAuth />
                </div>
            </div>
        </header>
    )
}
