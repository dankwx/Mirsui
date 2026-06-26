import { type NextRequest, NextResponse } from 'next/server'

import { createClientForActions } from '@/utils/supabase/server'

/**
 * Callback do OAuth (Google etc.).
 *
 * O fluxo PKCE do Supabase volta para cá com `?code=...`. Trocamos o code
 * pela sessão (que é persistida nos cookies via @supabase/ssr) e mandamos o
 * usuário para o destino final.
 *
 * Mantido separado de /auth/confirm de propósito: aquela rota assume que todo
 * `code` é recuperação de senha e redireciona para /reset-password.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClientForActions()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }

        console.error('Erro ao trocar code por sessão (OAuth):', error)
    }

    // Sem code ou falha na troca: volta para a home com um marcador de erro.
    return NextResponse.redirect(`${origin}/?auth_error=oauth`)
}
