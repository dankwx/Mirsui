'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { createClient } from '@/utils/supabase/server'

// Função para gerar um display name aleatório
function generateRandomDisplayName(): string {
    const adjectives = [
        'Happy',
        'Lucky',
        'Clever',
        'Brave',
        'Gentle',
        'Kind',
        'Swift',
        'Calm',
    ]
    const nouns = [
        'Tiger',
        'Eagle',
        'Dolphin',
        'Panda',
        'Lion',
        'Wolf',
        'Bear',
        'Fox',
    ]
    const randomAdjective =
        adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    const randomNumber = Math.floor(Math.random() * 1000)
    return `${randomAdjective}${randomNoun}${randomNumber}`
}

export async function login(formData: FormData) {
    const supabase = createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    // Obter o caminho atual
    const headersList = headers()
    const referer = headersList.get('referer') || '/'
    const currentPath = new URL(referer).pathname

    // Revalidar o caminho atual
    revalidatePath(currentPath)
    return { success: true }
}

export async function signup(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    const displayName = generateRandomDisplayName()

    const data = {
        email,
        password,
        options: {
            data: {
                username,
                display_name: displayName,
            },
        },
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    // Obter o caminho atual
    const headersList = headers()
    const referer = headersList.get('referer') || '/'
    const currentPath = new URL(referer).pathname

    // Revalidar o caminho atual
    revalidatePath(currentPath)
    return { success: true }
}
