import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Definindo a server action
async function updateUsername(formData: FormData) {
  'use server'
  
  const newUsername = formData.get('username')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user && newUsername) {
    const { error } = await supabase.auth.updateUser({
      data: { username: newUsername }
    })
    
    if (error) {
      console.error('Error updating username:', error)
    } else {
      revalidatePath('/profile') // Ajuste o caminho conforme necessário
    }
  }
}

export default async function UserProfile({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  const username = data.user?.user_metadata?.username || 'User'
  const displayname = data.user?.user_metadata?.display_name || 'User'

  return (
    <div className="flex flex-col">
      <p className="font-sans text-3xl font-bold">{displayname}</p>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="link" className="p-0">
            {username}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
          </DialogHeader>
          <form action={updateUsername}>
            <Input
              name="username"
              placeholder="New username"
              defaultValue={username}
            />
            <Button type="submit" className="mt-4">
              Update Username
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}