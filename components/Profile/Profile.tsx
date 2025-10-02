// components/Profile/Profile.tsx
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
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
        <div className="space-y-8">
            {/* Profile Section */}
            <div className="flex items-start gap-8">
                <Avatar
                    className={`h-32 w-32 border-4 border-border shadow-lg ${canEditAvatar ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={canEditAvatar ? onAvatarClick : undefined}
                >
                    <AvatarImage src={userData.avatar_url || undefined} className="object-cover" />
                    <AvatarFallback className="text-2xl">
                        {userData.first_name?.[0] ||
                            userData.username?.[0] ||
                            'U'}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <UserProfile
                        userData={userData}
                        isLoggedIn={isLoggedIn}
                        isOwnProfile={isOwnProfile}
                        updateDisplayNameAction={updateDisplayNameAction}
                        updateDescriptionAction={updateDescriptionAction}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button size="icon" className="bg-accent hover:bg-accent/90">
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
