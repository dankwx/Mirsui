'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function followUser(
    followerId: string,
    followingId: string
): Promise<{ success: boolean }> {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('followers')
            .insert([{ follower_id: followerId, following_id: followingId }])

        if (error) {
            console.error('Error following user:', error)
            return { success: false }
        }

        revalidatePath(`/user/${followingId}`)
        return { success: true }
    } catch (error) {
        console.error('Error in followUser:', error)
        return { success: false }
    }
}

export async function unfollowUser(
    followerId: string,
    followingId: string
): Promise<{ success: boolean }> {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('followers')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followingId)

        if (error) {
            console.error('Error unfollowing user:', error)
            return { success: false }
        }

        revalidatePath(`/user/${followingId}`)
        return { success: true }
    } catch (error) {
        console.error('Error in unfollowUser:', error)
        return { success: false }
    }
}
