'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from './actions'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

interface FollowButtonProps {
  followingId: string
  initialIsFollowing: boolean
}

export default function FollowButton({ followingId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleFollow = async () => {
    setIsLoading(true)
    try {
      const result = await toggleFollow(followingId)
      if (result.success) {
        setIsFollowing(result.isFollowing)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      className='relative w-8 h-8 p-0'
      onClick={handleToggleFollow} 
      disabled={isLoading}
      title={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        isFollowing ? <UserMinus className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />
      )}
    </Button>
  )
}