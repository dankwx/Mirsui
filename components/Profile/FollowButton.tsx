// ===================================
// components/Profile/FollowButton.tsx
// ===================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from './actions'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

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
        return (
            <Button
                {...buttonProps}
                size="sm"
                variant={isFollowing ? 'outline' : 'default'}
                className="h-8 w-8 p-0"
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

    return (
        <Button
            {...buttonProps}
            size="sm"
            variant={isFollowing ? 'outline' : 'default'}
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
