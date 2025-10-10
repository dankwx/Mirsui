// components/Profile/ProfilePage.tsx
'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Plus, PencilIcon } from "lucide-react"
import ModalChangeAvatar from '../ModalChangeAvatar/ModalChangeAvatar'
import UserBadges from './UserBadges'
import FollowersFollowingSection from './UserFollowers'
import FollowButton from './FollowButton'
import { updateDisplayName, updateDescription } from './actions'
import type { User, Achievement, Rating } from '@/types/profile'

interface ProfilePageProps {
    userData: User & {
        totalFollowers: User[]
        totalFollowing: User[]
        achievements: Achievement[]
        rating: Rating[]
    }
    isLoggedIn: boolean
    isOwnProfile: boolean
}

export default function ProfilePage({
    userData,
    isLoggedIn,
    isOwnProfile,
}: ProfilePageProps) {
    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [openDisplayName, setOpenDisplayName] = useState(false)
    const [openDescription, setOpenDescription] = useState(false)
    const [currentDisplayName, setCurrentDisplayName] = useState(
        userData.display_name || userData.username || ''
    )
    const [currentDescription, setCurrentDescription] = useState(
        userData.description || null
    )

    const canEdit = isOwnProfile && isLoggedIn
    const canEditAvatar = isOwnProfile && isLoggedIn

    const handleAvatarClick = () => {
        if (canEditAvatar) {
            setShowAvatarModal(true)
        }
    }

    const handleDisplayNameSubmit = async (formData: FormData) => {
        if (!canEdit) return

        try {
            const result = await updateDisplayName(formData)
            if (result.success && result.newDisplayName) {
                setCurrentDisplayName(result.newDisplayName)
                setOpenDisplayName(false)
            }
        } catch (error) {
            console.error('Error updating display name:', error)
        }
    }

    const handleDescriptionSubmit = async (formData: FormData) => {
        if (!canEdit) return

        try {
            const result = await updateDescription(formData)
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
                <Dialog open={openDisplayName} onOpenChange={setOpenDisplayName}>
                    <DialogTrigger asChild>
                        <Button
                            variant="link"
                            className="m-0 h-fit w-fit p-0 text-4xl font-bold text-foreground hover:underline"
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
            <h1 className="text-4xl font-bold text-foreground">
                {currentDisplayName}
            </h1>
        )
    }

    const DescriptionSection = () => {
        const displayDescription = currentDescription || 'No description'

        if (canEdit) {
            return (
                <Dialog open={openDescription} onOpenChange={setOpenDescription}>
                    <DialogTrigger asChild>
                        <div className="flex cursor-pointer items-center text-foreground hover:text-muted-foreground transition-colors">
                            <p
                                className={`text-sm ${!currentDescription ? 'italic text-muted-foreground' : 'text-foreground'}`}
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
                className={`text-sm ${!currentDescription ? 'italic text-muted-foreground' : 'text-foreground'}`}
            >
                {displayDescription}
            </p>
        )
    }

    return (
        <div className="space-y-8">
            {/* Profile Section */}
            <div className="flex items-start gap-8">
                <Avatar
                    className={`h-32 w-32 border-4 border-border shadow-lg ${canEditAvatar ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={canEditAvatar ? handleAvatarClick : undefined}
                >
                    <AvatarImage src={userData.avatar_url || undefined} className="object-cover" />
                    <AvatarFallback className="text-2xl">
                        {userData.first_name?.[0] ||
                            userData.username?.[0] ||
                            'U'}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <DisplayNameSection />
                            <span className="text-xl text-muted-foreground">
                                @{userData.username}
                            </span>
                        </div>

                        <div className="mb-3">
                            <FollowersFollowingSection
                                followers={userData.totalFollowers}
                                following={userData.totalFollowing}
                                rating={userData.rating}
                                isOwnProfile={isOwnProfile}
                                isLoggedIn={isLoggedIn}
                                currentUserId={userData.id}
                            />
                        </div>

                        <div className="mb-4">
                            <DescriptionSection />
                        </div>

                        <UserBadges userAchievments={userData.achievements} />
                    </div>

                    {!isOwnProfile && isLoggedIn && (
                        <div className="pt-2">
                            <FollowButton
                                followingId={userData.id}
                                initialIsFollowing={userData.isFollowing || false}
                                type="text"
                            />
                        </div>
                    )}
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

            {showAvatarModal && (
                <ModalChangeAvatar
                    username={userData.username}
                    id={userData.id}
                    avatar_url={userData.avatar_url}
                    onAvatarClick={setShowAvatarModal}
                />
            )}
        </div>
    )
}