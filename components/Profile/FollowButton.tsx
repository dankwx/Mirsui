'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from './actions'

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
      className='relative w-fit'
      onClick={handleToggleFollow} 
      disabled={isLoading}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        isFollowing ? 'Unfollow' : 'Follow'
      )}
    </Button>
  )
}