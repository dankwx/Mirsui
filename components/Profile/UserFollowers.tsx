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
import { Badge } from '@/components/ui/badge'
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
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
                <Avatar className="mr-3 h-12 w-12">
                    <AvatarImage
                        src={user.avatar_url || undefined}
                        alt={`${user.username}'s avatar`}
                    />
                    <AvatarFallback>
                        {user.first_name?.[0] || user.username?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
                <a
                    href={`/user/${user.username}`}
                    className="font-medium text-gray-800 hover:text-blue-500"
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
        <div className="mt-2 flex items-center space-x-4 font-sans">
            <Dialog>
                <DialogTrigger asChild>
                    <button className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        <span className="font-semibold">
                            {followers.length}
                        </span>{' '}
                        Seguidores
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Seguidores</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                        {followers.length > 0 ? (
                            followers.map((user) => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    showFollowButton={!isOwnProfile}
                                />
                            ))
                        ) : (
                            <p className="py-4 text-center text-gray-500">
                                Nenhum seguidor ainda
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog>
                <DialogTrigger asChild>
                    <button className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        <span className="font-semibold">
                            {following.length}
                        </span>{' '}
                        Seguindo
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Seguindo</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                        {following.length > 0 ? (
                            following.map((user) => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    showFollowButton={isOwnProfile}
                                />
                            ))
                        ) : (
                            <p className="py-4 text-center text-gray-500">
                                Não segue ninguém ainda
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Badge variant="secondary">{currentRating} pontos</Badge>
        </div>
    )
}
