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