import 'server-only'
import { getAccessToken } from '@/utils/supabase/get-access-token'
import type { Painel } from '@/utils/painelTypes'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

/**
 * Busca o estado do projeto no backend, no render do server component.
 *
 * O painel não passa pelo Supabase daqui de propósito. Quase tudo que ele
 * mostra está atrás do RLS — `auth.users` inteiro, e as fichas de todo mundo
 * (`stakes_select_own` só entrega as suas) —, então com a sessão do navegador
 * a resposta sairia com números silenciosamente menores em vez de um erro. A
 * service role key mora só no backend, e é lá que a consulta roda.
 *
 * `erro` separa "não carregou" de "está vazio", que numa tela de números é a
 * diferença entre um susto e um fato.
 */
export async function getOverview(): Promise<{
    painel: Painel | null
    erro: string | null
}> {
    const token = await getAccessToken()
    if (!token) return { painel: null, erro: 'Sessão expirada.' }

    try {
        const res = await fetch(`${BACKEND_URL}/admin/overview`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })

        if (!res.ok) {
            // 404 aqui é a resposta que o backend dá para quem não é dono. Se
            // ela aparecer, as duas listas de e-mail saíram de sincronia.
            const motivo =
                res.status === 404
                    ? 'O backend não reconhece esta conta como dona.'
                    : `O backend respondeu ${res.status}.`
            return { painel: null, erro: motivo }
        }

        return { painel: (await res.json()) as Painel, erro: null }
    } catch (error) {
        console.error('Erro ao buscar o painel:', error)
        return { painel: null, erro: 'O backend não respondeu.' }
    }
}
