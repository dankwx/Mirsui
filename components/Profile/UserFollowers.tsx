'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import FotoDePerfil from '@/components/FotoDePerfil'
import recipes from '@/components/Club/club-recipes.module.css'
import FollowButton from './FollowButton'
import type { Rating, User } from '@/types/profile'
import styles from './UserFollowers.module.css'

const SHOW_SCORE = false

interface FollowersFollowingSectionProps {
    followers: User[]
    following: User[]
    rating: Rating[]
    isOwnProfile: boolean
    isLoggedIn: boolean
    currentUserId: string
}

function initialsOf(user: User) {
    return (user.display_name || user.username || 'U').slice(0, 2).toUpperCase()
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
        <div className={styles.userItem}>
            <div className={styles.userIdentity}>
                <div className={styles.avatar}>
                    <FotoDePerfil
                        src={user.avatar_url}
                        className={styles.avatarImage}
                    >
                        <span>{initialsOf(user)}</span>
                    </FotoDePerfil>
                </div>
                <div className={styles.userCopy}>
                    <Link href={`/user/${user.username || user.id}`}>
                        {user.display_name || user.username || 'Usuário'}
                    </Link>
                    {user.username && <span>@{user.username}</span>}
                </div>
            </div>
            {showFollowButton && isLoggedIn && user.id !== currentUserId && (
                <FollowButton
                    followingId={user.id}
                    initialIsFollowing={user.isFollowing || false}
                    type="text"
                    compact
                />
            )}
        </div>
    )

    const statTrigger = (count: number, label: string) => (
        <button
            type="button"
            className={recipes.statTrigger}
            aria-label={`Ver ${label}`}
        >
            <span className={recipes.statValue}>{count}</span>
            <span className={recipes.statLabel}>{label}</span>
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
                <DialogContent
                    className={styles.dialogContent}
                    overlayClassName={styles.dialogOverlay}
                    closeClassName={styles.dialogClose}
                >
                    <DialogHeader className={styles.dialogHeader}>
                        <DialogTitle className={styles.dialogTitle}>
                            Seguidores
                        </DialogTitle>
                    </DialogHeader>
                    <div className={styles.userList}>
                        {followers.length > 0 ? (
                            followers.map((user) => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    showFollowButton={!isOwnProfile}
                                />
                            ))
                        ) : (
                            <p className={styles.empty}>Nenhum seguidor ainda.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog>
                <DialogTrigger asChild>
                    {statTrigger(following.length, 'seguindo')}
                </DialogTrigger>
                <DialogContent
                    className={styles.dialogContent}
                    overlayClassName={styles.dialogOverlay}
                    closeClassName={styles.dialogClose}
                >
                    <DialogHeader className={styles.dialogHeader}>
                        <DialogTitle className={styles.dialogTitle}>
                            Seguindo
                        </DialogTitle>
                    </DialogHeader>
                    <div className={styles.userList}>
                        {following.length > 0 ? (
                            following.map((user) => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    showFollowButton={isOwnProfile}
                                />
                            ))
                        ) : (
                            <p className={styles.empty}>Não segue ninguém ainda.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {SHOW_SCORE && (
                <div className={styles.score}>
                    <span>
                        <Star size={16} aria-hidden="true" />
                        {currentRating}
                    </span>
                    <small>score</small>
                </div>
            )}
        </>
    )
}
