'use client'

import { Loader2, UserMinus, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { capture } from '@/lib/posthog'
import recipes from '@/components/Club/club-recipes.module.css'
import { toggleFollow } from './actions'
import styles from './FollowButton.module.css'

type ButtonType = 'icon' | 'text'

interface FollowButtonProps {
    followingId: string
    initialIsFollowing: boolean
    type?: ButtonType
    compact?: boolean
}

export default function FollowButton({
    followingId,
    initialIsFollowing,
    type = 'icon',
    compact = false,
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggleFollow = async () => {
        setIsLoading(true)
        try {
            const result = await toggleFollow(followingId)
            if (result.success && typeof result.isFollowing === 'boolean') {
                setIsFollowing(result.isFollowing)
                capture(
                    result.isFollowing ? 'user_followed' : 'user_unfollowed',
                    { following_id: followingId }
                )
            }
        } catch (error) {
            console.error('Error toggling follow:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const label = isFollowing ? 'Deixar de seguir' : 'Seguir'
    const icon = isLoading ? (
        <Loader2 className={styles.spinner} aria-hidden="true" />
    ) : isFollowing ? (
        <UserMinus aria-hidden="true" />
    ) : (
        <UserPlus aria-hidden="true" />
    )

    if (type === 'icon') {
        return (
            <button
                type="button"
                onClick={handleToggleFollow}
                disabled={isLoading}
                aria-label={label}
                title={label}
                className={`${styles.iconButton} ${isFollowing ? styles.following : styles.primary}`}
            >
                {icon}
            </button>
        )
    }

    return (
        <button
            type="button"
            onClick={handleToggleFollow}
            disabled={isLoading}
            title={label}
            className={`${recipes.button} ${compact ? recipes.buttonSmall : ''} ${styles.textButton} ${isFollowing ? styles.following : styles.primary}`}
        >
            {icon}
            {isLoading ? 'Carregando...' : label}
        </button>
    )
}
