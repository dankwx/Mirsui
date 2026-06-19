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
import { Star } from 'lucide-react'
import FollowButton from './FollowButton'
import type { User, Rating } from '@/types/profile'

// score retirado da UI do perfil por enquanto — manter o código
const SHOW_SCORE = false

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
        <div className="flex items-center justify-between rounded-xl border border-mir-line bg-mir-fill1 px-3.5 py-3">
            <div className="flex items-center">
                <Avatar className="mr-3 h-10 w-10 rounded-full border border-mir-line bg-mir-card">
                    <AvatarImage
                        src={user.avatar_url || undefined}
                        alt={`${user.username}'s avatar`}
                    />
                    <AvatarFallback className="rounded-full bg-mir-card text-sm font-bold text-mir-text">
                        {user.first_name?.[0] || user.username?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
                <a
                    href={`/user/${user.username}`}
                    className="font-mono text-[13px] text-mir-text2 transition hover:text-mir-acc"
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

    const statTrigger = (count: number, label: string) => (
        <button className="group flex flex-col text-left">
            <span className="text-[28px] font-extrabold leading-none tracking-[-0.03em] tabular-nums text-[#ece3d2] transition group-hover:text-[#cdef36] sm:text-[32px]">
                {count}
            </span>
            <span className="mt-[5px] font-mono text-[10px] uppercase tracking-[0.14em] text-[#ece3d2]/45">
                {label}
            </span>
        </button>
    )

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    {statTrigger(
                        followers.length,
                        followers.length === 1 ? 'seguidor' : 'seguidores'
                    )}
                </DialogTrigger>
                <DialogContent className="max-w-md border border-mir-line bg-mir-surface text-mir-text shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold tracking-tight text-mir-text">
                            Seguidores
                        </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
                        {followers.length > 0 ? (
                            followers.map((user) => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    showFollowButton={!isOwnProfile}
                                />
                            ))
                        ) : (
                            <p className="rounded-xl border border-dashed border-mir-line2 px-6 py-10 text-center font-mono text-[13px] text-mir-text3">
                                nenhum seguidor ainda
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog>
                <DialogTrigger asChild>
                    {statTrigger(following.length, 'seguindo')}
                </DialogTrigger>
                <DialogContent className="max-w-md border border-mir-line bg-mir-surface text-mir-text shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold tracking-tight text-mir-text">
                            Seguindo
                        </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
                        {following.length > 0 ? (
                            following.map((user) => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    showFollowButton={isOwnProfile}
                                />
                            ))
                        ) : (
                            <p className="rounded-xl border border-dashed border-mir-line2 px-6 py-10 text-center font-mono text-[13px] text-mir-text3">
                                não segue ninguém ainda
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {SHOW_SCORE && (
                <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-[22px] font-extrabold leading-none tracking-tight tabular-nums text-mir-text">
                        <Star className="h-4 w-4 text-mir-acc" />
                        {currentRating}
                    </span>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
                        score
                    </span>
                </div>
            )}
        </>
    )
}
