// ===================================
// components/Profile/UserFollowers.tsx
// ===================================

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, UserCheck, Star } from 'lucide-react'
import FollowButton from './FollowButton'
import type { User, Rating } from '@/types/profile'

interface FollowersFollowingSectionProps {
    followers: User[]
    following: User[]
    rating: Rating[]
    isOwnProfile: boolean
    isLoggedIn: boolean
    currentUserId: string
}

export default function FollowersFollowingSection({
    followers,
    following,
    rating,
    isOwnProfile,
    isLoggedIn,
    currentUserId,
}: FollowersFollowingSectionProps) {
    const currentRating = rating.length > 0 ? rating[0].rating : 0

    const UserListItem = ({
        user,
        showFollowButton = false,
    }: {
        user: User
        showFollowButton?: boolean
    }) => (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 shadow-[0_14px_35px_rgba(8,4,20,0.4)]">
            <div className="flex items-center">
                <Avatar className="mr-3 h-11 w-11 rounded-[18px] border border-white/10 bg-white/[0.06]">
                    <AvatarImage
                        src={user.avatar_url || undefined}
                        alt={`${user.username}'s avatar`}
                    />
                    <AvatarFallback className="rounded-[16px] bg-purple-500/20 text-sm font-semibold text-purple-200">
                        {user.first_name?.[0] || user.username?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
                <a
                    href={`/user/${user.username}`}
                    className="text-sm font-medium text-white/80 transition hover:text-purple-200"
                >
                    @{user.username}
                </a>
            </div>

            {showFollowButton && isLoggedIn && user.id !== currentUserId && (
                <FollowButton
                    followingId={user.id}
                    initialIsFollowing={user.isFollowing || false}
                    type="text"
                />
            )}
        </div>
    )

    return (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 text-sm text-white/70 shadow-[0_20px_50px_rgba(8,4,20,0.4)]">
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-white/40">
                community signal
            </p>

            <div className="flex flex-wrap gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/65 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white">
                            <Users className="h-4 w-4 text-purple-300" />
                            <span>{followers.length}</span>
                            <span>{followers.length === 1 ? 'seguidor' : 'seguidores'}</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl border border-white/10 bg-[#05030f]/95 text-white shadow-[0_25px_60px_rgba(8,4,20,0.65)]">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold text-white/90">
                                Seguidores
                            </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                            {followers.length > 0 ? (
                                followers.map((user) => (
                                    <UserListItem
                                        key={user.id}
                                        user={user}
                                        showFollowButton={!isOwnProfile}
                                    />
                                ))
                            ) : (
                                <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center text-sm text-white/50">
                                    Nenhum seguidor ainda
                                </p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog>
                    <DialogTrigger asChild>
                        <button className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/65 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white">
                            <UserCheck className="h-4 w-4 text-emerald-300" />
                            <span>{following.length}</span>
                            <span>seguindo</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl border border-white/10 bg-[#05030f]/95 text-white shadow-[0_25px_60px_rgba(8,4,20,0.65)]">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold text-white/90">
                                Seguindo
                            </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                            {following.length > 0 ? (
                                following.map((user) => (
                                    <UserListItem
                                        key={user.id}
                                        user={user}
                                        showFollowButton={isOwnProfile}
                                    />
                                ))
                            ) : (
                                <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center text-sm text-white/50">
                                    Não segue ninguém ainda
                                </p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/60">
                <span className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-300" />
                    credibility score
                </span>
                <span className="flex items-center gap-1 text-white">
                    {currentRating}
                    <span className="text-white/50">
                        {currentRating === 1 ? 'pt' : 'pts'}
                    </span>
                </span>
            </div>
        </div>
    )
}
