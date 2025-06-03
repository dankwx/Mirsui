// ===================================
// components/Profile/GetUsername.tsx
// ===================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { PencilIcon } from 'lucide-react'
import UserBadges from './UserBadges'
import FollowersFollowingSection from './UserFollowers'
import FollowButton from './FollowButton'
import type { User, Achievement, Rating } from '@/types/profile'

interface UserProfileProps {
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
}

export default function UserProfile({
    userData,
    isLoggedIn,
    isOwnProfile,
    updateDisplayNameAction,
    updateDescriptionAction,
}: UserProfileProps) {
    const [openDisplayName, setOpenDisplayName] = useState(false)
    const [openDescription, setOpenDescription] = useState(false)
    const [currentDisplayName, setCurrentDisplayName] = useState(
        userData.display_name || userData.username || ''
    )
    const [currentDescription, setCurrentDescription] = useState(
        userData.description || null
    )

    const canEdit = isOwnProfile && isLoggedIn

    const handleDisplayNameSubmit = async (formData: FormData) => {
        if (!updateDisplayNameAction) return

        try {
            const result = await updateDisplayNameAction(formData)
            if (result.success && result.newDisplayName) {
                setCurrentDisplayName(result.newDisplayName)
                setOpenDisplayName(false)
            }
        } catch (error) {
            console.error('Error updating display name:', error)
        }
    }

    const handleDescriptionSubmit = async (formData: FormData) => {
        if (!updateDescriptionAction) return

        try {
            const result = await updateDescriptionAction(formData)
            if (result.success) {
                setCurrentDescription(result.newDescription || null)
                setOpenDescription(false)
            }
        } catch (error) {
            console.error('Error updating description:', error)
        }
    }

    const DisplayNameSection = () => {
        if (canEdit) {
            return (
                <Dialog
                    open={openDisplayName}
                    onOpenChange={setOpenDisplayName}
                >
                    <DialogTrigger asChild>
                        <Button
                            variant="link"
                            className="m-0 h-fit w-fit p-0 font-sans text-3xl font-bold hover:underline"
                        >
                            {currentDisplayName}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Display Name</DialogTitle>
                        </DialogHeader>
                        <form action={handleDisplayNameSubmit}>
                            <Input
                                name="display_name"
                                placeholder="New display name"
                                defaultValue={currentDisplayName}
                                required
                            />
                            <Button type="submit" className="mt-4">
                                Update Display Name
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )
        }

        return (
            <h1 className="font-sans text-3xl font-bold">
                {currentDisplayName}
            </h1>
        )
    }

    const DescriptionSection = () => {
        const displayDescription = currentDescription || 'No description'

        if (canEdit) {
            return (
                <Dialog
                    open={openDescription}
                    onOpenChange={setOpenDescription}
                >
                    <DialogTrigger asChild>
                        <div className="flex cursor-pointer items-center text-gray-600 hover:text-gray-800">
                            <p
                                className={`font-sans text-sm ${!currentDescription ? 'italic' : ''}`}
                            >
                                {displayDescription}
                            </p>
                            <PencilIcon size={16} className="ml-2" />
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Description</DialogTitle>
                        </DialogHeader>
                        <form action={handleDescriptionSubmit}>
                            <Textarea
                                name="description"
                                placeholder="Write a description about yourself..."
                                defaultValue={currentDescription || ''}
                                rows={4}
                            />
                            <Button type="submit" className="mt-4">
                                Update Description
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )
        }

        return (
            <p
                className={`font-sans text-sm text-gray-600 ${!currentDescription ? 'italic' : ''}`}
            >
                {displayDescription}
            </p>
        )
    }

    return (
        <div className="flex h-fit flex-col">
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <DisplayNameSection />
                        <span className="text-gray-600">
                            @{userData.username}
                        </span>
                    </div>

                    <FollowersFollowingSection
                        followers={userData.totalFollowers}
                        following={userData.totalFollowing}
                        rating={userData.rating}
                        isOwnProfile={isOwnProfile}
                        isLoggedIn={isLoggedIn}
                        currentUserId={userData.id}
                    />

                    <div className="mt-2">
                        <DescriptionSection />
                    </div>
                </div>

                {!isOwnProfile && isLoggedIn && (
                    <FollowButton
                        followingId={userData.id}
                        initialIsFollowing={userData.isFollowing || false}
                        type="text"
                    />
                )}
            </div>

            <UserBadges userAchievments={userData.achievements} />
        </div>
    )
}
