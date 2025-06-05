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
    return (
        <header className="border-b border-border bg-background px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <SearchWithResults />
                </div>

                <div className="flex items-center gap-4">
                    {/* Você pode usar userProfile aqui também se quiser customizar o GetAuth */}
                    <GetAuth />
                </div>
            </div>
        </header>
    )
}
