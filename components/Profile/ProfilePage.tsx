// components/Profile/ProfilePage.tsx
'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Search, Plus, PencilIcon } from 'lucide-react'
import Link from 'next/link'
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
                            className="m-0 h-fit w-fit p-0 text-3xl font-semibold tracking-tight text-white transition hover:text-purple-300"
                        >
                            {currentDisplayName}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border border-white/10 bg-[#05030f]/95 text-white shadow-[0_30px_80px_rgba(8,4,20,0.65)] backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold text-white">Change Display Name</DialogTitle>
                        </DialogHeader>
                        <form action={handleDisplayNameSubmit}>
                            <Input
                                name="display_name"
                                placeholder="New display name"
                                defaultValue={currentDisplayName}
                                required
                                className="mt-4 border-white/15 bg-white/[0.06] text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-purple-400/40"
                            />
                            <Button
                                type="submit"
                                className="mt-6 w-full rounded-full border border-white/10 bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-semibold uppercase tracking-[0.3em] shadow-[0_18px_45px_rgba(132,94,255,0.35)] transition hover:from-purple-600 hover:to-pink-600"
                            >
                                Update Display Name
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )
        }

        return (
            <h1 className="text-3xl font-semibold tracking-tight text-white">
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
                        <div className="flex cursor-pointer items-center text-white/65 transition hover:text-purple-200">
                            <p
                                className={`text-sm leading-relaxed ${!currentDescription ? 'italic text-white/40' : 'text-white/70'}`}
                            >
                                {displayDescription}
                            </p>
                            <PencilIcon size={16} className="ml-2 text-white/40" />
                        </div>
                    </DialogTrigger>
                    <DialogContent className="border border-white/10 bg-[#05030f]/95 text-white shadow-[0_30px_80px_rgba(8,4,20,0.65)] backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold text-white">Change Description</DialogTitle>
                        </DialogHeader>
                        <form action={handleDescriptionSubmit}>
                            <Textarea
                                name="description"
                                placeholder="Write a description about yourself..."
                                defaultValue={currentDescription || ''}
                                rows={4}
                                className="border-white/15 bg-white/[0.06] text-white placeholder:text-white/40 focus:border-purple-400 focus:ring-purple-400/40"
                            />
                            <Button
                                type="submit"
                                className="mt-6 w-full rounded-full border border-white/10 bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-semibold uppercase tracking-[0.3em] shadow-[0_18px_45px_rgba(132,94,255,0.35)] transition hover:from-purple-600 hover:to-pink-600"
                            >
                                Update Description
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )
        }

        return (
            <p
                className={`text-sm leading-relaxed ${!currentDescription ? 'italic text-white/40' : 'text-white/70'}`}
            >
                {displayDescription}
            </p>
        )
    }

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_30px_80px_rgba(8,4,20,0.4)] backdrop-blur-lg sm:px-8">
                <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,92,255,0.28),_transparent_65%)] blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,113,181,0.22),_transparent_65%)] blur-3xl" />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start">
                    <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-start">
                        <div className="group relative w-fit">
                            <Avatar
                                className={`h-28 w-28 rounded-[24px] border border-white/10 bg-white/[0.08] p-1 shadow-[0_25px_60px_rgba(8,4,20,0.5)] ring-4 ring-transparent transition duration-300 ${
                                    canEditAvatar
                                        ? 'cursor-pointer hover:scale-[1.03] hover:ring-purple-400/40'
                                        : ''
                                }`}
                                onClick={canEditAvatar ? handleAvatarClick : undefined}
                            >
                                <AvatarImage src={userData.avatar_url || undefined} className="rounded-[24px] object-cover" />
                                <AvatarFallback className="rounded-[24px] bg-gradient-to-br from-purple-500/70 via-purple-600/60 to-pink-500/70 text-xl font-semibold text-white">
                                    {userData.first_name?.[0] || userData.username?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                    <DisplayNameSection />
                                    <span className="text-sm uppercase tracking-[0.35em] text-white/40">
                                        @{userData.username}
                                    </span>
                                </div>

                                <DescriptionSection />
                            </div>

                            <UserBadges userAchievments={userData.achievements} />

                            <div className="flex flex-wrap gap-2">
                                {canEditAvatar && (
                                    <Button
                                        onClick={handleAvatarClick}
                                        variant="ghost"
                                        className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.12] hover:text-white"
                                    >
                                        Edit avatar
                                    </Button>
                                )}
                                {canEdit && (
                                    <Button
                                        onClick={() => setOpenDescription(true)}
                                        variant="ghost"
                                        className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.12] hover:text-white"
                                    >
                                        Update bio
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-4 xl:max-w-sm">
                        <FollowersFollowingSection
                            followers={userData.totalFollowers}
                            following={userData.totalFollowing}
                            rating={userData.rating}
                            isOwnProfile={isOwnProfile}
                            isLoggedIn={isLoggedIn}
                            currentUserId={userData.id}
                        />

                        <div className="flex flex-wrap gap-2">
                            {!isOwnProfile && isLoggedIn && (
                                <FollowButton
                                    followingId={userData.id}
                                    initialIsFollowing={userData.isFollowing || false}
                                    type="text"
                                />
                            )}
                            <Button
                                variant="ghost"
                                asChild
                                className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.12] hover:text-white"
                            >
                                <Link href="/feed" className="flex items-center">
                                    <Search className="mr-2 h-4 w-4" />
                                    Explore feed
                                </Link>
                            </Button>
                            <Button
                                asChild
                                className="rounded-full border border-white/10 bg-gradient-to-r from-purple-500 to-pink-500 px-3.5 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-[0_18px_45px_rgba(132,94,255,0.35)] transition hover:from-purple-600 hover:to-pink-600"
                            >
                                <Link href="/claimtrack" className="flex items-center">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Claim track
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

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