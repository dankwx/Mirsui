'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function signup(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    // Verificar se o username já existe
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

    if (existingUser) {
        return { error: 'Nome de usuário já está em uso' }
    }

    // Gerar um display name aleatório
    const displayName = generateRandomDisplayName()

    // URL padrão para o avatar
    const defaultAvatarUrl =
        'https://tqprioqqitimssshcrcr.supabase.co/storage/v1/object/public/user-profile-images/default.jpg'

    const data = {
        email,
        password,
        options: {
            data: {
                username,
                display_name: displayName,
                avatar_url: defaultAvatarUrl,
            },
        },
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
