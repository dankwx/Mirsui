'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation';


export async function updateUsername(formData: FormData): Promise<{ success: boolean; newUsername?: string }> {
  const newUsername = formData.get('username')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user && newUsername && typeof newUsername === 'string') {
    // Atualizar o username na tabela 'profiles'
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return { success: false }
    }

    // Atualizar o username nos metadados do usuário
    const { error: userError } = await supabase.auth.updateUser({
      data: { username: newUsername }
    })

    if (userError) {
      console.error('Error updating user metadata:', userError)
      return { success: false }
    }

    revalidatePath(`/user/${newUsername}`)
    redirect(`/user/${newUsername}`)
  }
  return { success: false }
}

export async function updateDescription(formData: FormData): Promise<{ success: boolean; newDescription?: string | null }> {
  const newDescription = formData.get('description')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Converta a string vazia para null aqui
    const descriptionToUpdate = newDescription === '' ? null : newDescription as string

    // Atualizar a descrição na tabela 'profiles'
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ description: descriptionToUpdate })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating profile description:', profileError)
      return { success: false }
    }

    // Atualizar a descrição nos metadados do usuário (se necessário)
    const { error: userError } = await supabase.auth.updateUser({
      data: { description: descriptionToUpdate }
    })

    if (userError) {
      console.error('Error updating user metadata:', userError)
      return { success: false }
    }

    revalidatePath(`/user/${user.id}`) // ou o caminho apropriado para o perfil do usuário
    return { success: true, newDescription: descriptionToUpdate }
  }
  return { success: false }
}

export async function toggleFollow(followingId: string): Promise<{ success: boolean; isFollowing: boolean }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, isFollowing: false }
  }

  const follower_id = user.id
  
  // Check if already following
  const { data: existingFollow, error: checkError } = await supabase
    .from('followers')
    .select()
    .eq('follower_id', follower_id)
    .eq('following_id', followingId)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking follow status:', checkError)
    return { success: false, isFollowing: false }
  }

  if (existingFollow) {
    // Unfollow
    const { error: unfollowError } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', follower_id)
      .eq('following_id', followingId)

    if (unfollowError) {
      console.error('Error unfollowing:', unfollowError)
      return { success: false, isFollowing: true }
    }

    revalidatePath(`/user/${followingId}`)
    return { success: true, isFollowing: false }
  } else {
    // Follow
    const { error: followError } = await supabase
      .from('followers')
      .insert({ follower_id, following_id: followingId })

    if (followError) {
      console.error('Error following:', followError)
      return { success: false, isFollowing: false }
    }

    revalidatePath(`/user/${followingId}`)
    return { success: true, isFollowing: !existingFollow }
  }
}