// Em app/api/follow-status/route.ts

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const followingId = searchParams.get('followingId')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !followingId) {
    return NextResponse.json({ isFollowing: false }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('followers')
    .select()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking follow status:', error)
    return NextResponse.json({ isFollowing: false }, { status: 500 })
  }

  return NextResponse.json({ isFollowing: !!data })
}