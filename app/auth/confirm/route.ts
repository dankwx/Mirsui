import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClientForActions } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    const supabase = await createClientForActions()

    // Novo fluxo PKCE - usando code (usado pelo Supabase para recovery emails)
    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error && data.session) {
            // Quando é um fluxo de password recovery, o Supabase define um flag especial
            // Por padrão, vamos assumir que qualquer exchangeCodeForSession é uma recuperação
            // se o next não foi especificado ou é o padrão
            if (next === '/' || !searchParams.has('next')) {
                redirect('/reset-password')
            }
            redirect(next)
        }
    }

    // Fluxo antigo - usando token_hash (mantido para compatibilidade)
    if (type === 'recovery' && token_hash) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        
        if (!error) {
            redirect('/reset-password')
        }
        
        redirect('/reset-password')
    }

    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error) {
            redirect(next)
        }
    }

    // redirect the user to an error page with some instructions
    redirect('/error')
}
