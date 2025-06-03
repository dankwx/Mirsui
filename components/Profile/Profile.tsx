// ===================================
// components/Profile/Profile.tsx
// ===================================

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import UserProfile from './GetUsername'
import type { User, Achievement, Rating } from '@/types/profile'

interface ProfileProps {
    userData: User & {
        totalFollowers: User[]
        totalFollowing: User[]
        achievements: Achievement[]
        rating: Rating[]
    }
    isLoggedIn: boolean
    isOwnProfile: boolean
    updateDisplayNameAction?: (
        formData: FormData
    ) => Promise<{ success: boolean; newDisplayName?: string }>
    updateDescriptionAction?: (
        formData: FormData
    ) => Promise<{ success: boolean; newDescription?: string | null }>
    onAvatarClick?: () => void
}

export default function Profile({
    userData,
    isLoggedIn,
    isOwnProfile,
    updateDisplayNameAction,
    updateDescriptionAction,
    onAvatarClick,
}: ProfileProps) {
    const canEditAvatar = isOwnProfile && isLoggedIn

    return (
        <div className="mt-16 pt-4">
            <div className="flex">
                <Avatar
                    className={`mr-4 h-20 w-20 ${canEditAvatar ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={canEditAvatar ? onAvatarClick : undefined}
                >
                    <AvatarImage src={userData.avatar_url || undefined} />
                    <AvatarFallback>
                        {userData.first_name?.[0] ||
                            userData.username?.[0] ||
                            'U'}
                    </AvatarFallback>
                </Avatar>

                <UserProfile
                    userData={userData}
                    isLoggedIn={isLoggedIn}
                    isOwnProfile={isOwnProfile}
                    updateDisplayNameAction={updateDisplayNameAction}
                    updateDescriptionAction={updateDescriptionAction}
                />
            </div>
        </div>
    )
}
