// ===================================
// components/Profile/FollowButton.tsx
// ===================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from './actions'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { capture } from '@/lib/posthog'

type ButtonType = 'icon' | 'text'

interface FollowButtonProps {
    followingId: string
    initialIsFollowing: boolean
    type?: ButtonType
}

export default function FollowButton({
    followingId,
    initialIsFollowing,
    type = 'icon',
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

    const buttonProps = {
        onClick: handleToggleFollow,
        disabled: isLoading,
        title: isFollowing ? 'Deixar de seguir' : 'Seguir',
    }

    if (type === 'icon') {
        const iconClass = cn(
            'h-10 w-10 rounded-full border transition',
            isFollowing
                ? 'border-mir-line2 bg-mir-fill1 text-mir-text2 hover:bg-mir-fill2 hover:text-mir-text'
                : 'border-transparent bg-mir-acc text-mir-on-acc hover:bg-mir-acc hover:brightness-105'
        )

        return (
            <Button
                {...buttonProps}
                size="icon"
                variant="ghost"
                className={iconClass}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                    <UserMinus className="h-4 w-4" />
                ) : (
                    <UserPlus className="h-4 w-4" />
                )}
            </Button>
        )
    }

    const textClass = cn(
        'rounded-[9px] border px-[18px] py-[9px] text-[13.5px] font-semibold transition active:translate-y-px',
        isFollowing
            ? 'border-mir-line2 bg-transparent text-mir-text2 hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text'
            : 'border-transparent bg-mir-acc text-mir-on-acc hover:bg-mir-acc hover:brightness-105'
    )

    return (
        <Button
            {...buttonProps}
            size="sm"
            variant="ghost"
            className={textClass}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                </>
            ) : isFollowing ? (
                'Deixar de seguir'
            ) : (
                'Seguir'
            )}
        </Button>
    )
}
