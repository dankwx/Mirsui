import 'server-only'
import { getAccessToken } from '@/utils/supabase/get-access-token'
import type { FilaDeSaltos, StatusDoSalto } from '@/utils/saltosTypes'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

/**
 * A fila de saltos de um status, lida no backend — mesma porta do painel
 * (get-overview.ts): as tabelas da 052 são fechadas e só a service role, que
 * mora no backend, executa as funções do painel.
 */
export async function getSaltos(status: StatusDoSalto): Promise<{
    fila: FilaDeSaltos | null
    erro: string | null
}> {
    const token = await getAccessToken()
    if (!token) return { fila: null, erro: 'Sessão expirada.' }

    try {
        const res = await fetch(
            `${BACKEND_URL}/admin/saltos?status=${encodeURIComponent(status)}`,
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
            return { fila: null, erro: motivo }
        }

        return { fila: (await res.json()) as FilaDeSaltos, erro: null }
    } catch (error) {
        console.error('Erro ao buscar a fila de saltos:', error)
        return { fila: null, erro: 'O backend não respondeu.' }
    }
}
