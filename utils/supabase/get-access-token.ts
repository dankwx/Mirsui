import { createClient } from './server'

/**
 * Retorna o access token da sessão atual (ou null se não autenticado).
 * Use em Route Handlers que repassam o token para o backend.
 * O @supabase/ssr cuida do parsing do cookie (incluindo formato base64 e chunked).
 */
export async function getAccessToken(): Promise<string | null> {
    try {
        const supabase = await createClient()
        const {
            data: { session },
        } = await supabase.auth.getSession()
        return session?.access_token ?? null
    } catch (error) {
        console.error('Erro ao obter access token:', error)
        return null
    }
}
