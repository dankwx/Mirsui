import 'server-only'
import { getAccessToken } from '@/utils/supabase/get-access-token'
import type { Semeados } from '@/utils/painelTypes'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

/**
 * Uma página da lista de perfis semeados, no render do server component.
 *
 * Mesma razão do `getOverview`: `seeded_profiles` tem RLS sem policy, então
 * pela sessão do navegador a lista viria vazia em vez de dar erro. Quem lê é
 * a service role, e ela mora no backend.
 */
export async function getSemeados(page: number): Promise<{
    semeados: Semeados | null
    erro: string | null
}> {
    const token = await getAccessToken()
    if (!token) return { semeados: null, erro: 'Sessão expirada.' }

    try {
        const res = await fetch(
            `${BACKEND_URL}/admin/seed/profiles?page=${page}&limit=50`,
            {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            }
        )

        if (!res.ok) {
            const motivo =
                res.status === 404
                    ? 'O backend não reconhece esta conta como dona.'
                    : `O backend respondeu ${res.status}.`
            return { semeados: null, erro: motivo }
        }

        return { semeados: (await res.json()) as Semeados, erro: null }
    } catch (error) {
        console.error('Erro ao buscar os perfis semeados:', error)
        return { semeados: null, erro: 'O backend não respondeu.' }
    }
}
