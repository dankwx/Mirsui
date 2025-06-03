// ===================================
// components/Profile/ProfileDetails.tsx
// ===================================

'use client'

import { useState } from 'react'
import Profile from '@/components/Profile/Profile'
import ModalChangeAvatar from '../ModalChangeAvatar/ModalChangeAvatar'
import {
    updateDisplayName,
    updateDescription,
} from '@/components/Profile/actions'
import type { User, Achievement, Rating } from '@/types/profile'

interface ProfileDetailsProps {
    userData: User & {
        totalFollowers: User[]
        totalFollowing: User[]
        achievements: Achievement[]
        rating: Rating[]
    }
    isLoggedIn: boolean
    isOwnProfile: boolean
}

export default function ProfileDetails({
    userData,
    isLoggedIn,
    isOwnProfile,
}: ProfileDetailsProps) {
    const [showAvatarModal, setShowAvatarModal] = useState(false)

    const handleAvatarClick = () => {
        // Only allow avatar change if it's own profile and user is logged in
        if (isOwnProfile && isLoggedIn) {
            setShowAvatarModal(true)
        }
    }

    return (
        <>
            <Profile
                userData={userData}
                isLoggedIn={isLoggedIn}
                isOwnProfile={isOwnProfile}
                updateDisplayNameAction={
                    isOwnProfile ? updateDisplayName : undefined
                }
                updateDescriptionAction={
                    isOwnProfile ? updateDescription : undefined
                }
                onAvatarClick={handleAvatarClick}
            />

            {showAvatarModal && (
                <ModalChangeAvatar
                    username={userData.username}
                    id={userData.id}
                    avatar_url={userData.avatar_url}
                    onAvatarClick={setShowAvatarModal}
                />
            )}
        </>
    )
}
