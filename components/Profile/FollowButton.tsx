// ===================================
// components/Profile/FollowButton.tsx
// ===================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from './actions'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        const iconClass = cn(
            'h-10 w-10 rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:border-white/25 hover:bg-white/[0.12]',
            isFollowing
                ? 'text-white/80'
                : 'bg-gradient-to-r from-purple-500/85 to-pink-500/85 text-white shadow-[0_18px_45px_rgba(132,94,255,0.35)] hover:from-purple-600/90 hover:to-pink-600/90'
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
        'rounded-full border border-white/12 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition',
        isFollowing
            ? 'bg-white/[0.08] text-white/75 hover:border-white/25 hover:bg-white/[0.12] hover:text-white'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_18px_45px_rgba(132,94,255,0.35)] hover:from-purple-600 hover:to-pink-600'
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
