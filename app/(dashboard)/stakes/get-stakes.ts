import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// Busca stakes + total de pontos direto no backend, no servidor.
// Roda no render do server component, então os dados já chegam no HTML
// (sem esperar hidratação e sem o salto extra pelo proxy /api/stakes).
// `failed` separa "não tem ficha na mesa" de "a busca falhou". Sem isso, um 429
// ou um 500 renderizava as três vagas vazias e parecia que as fichas do usuário
// tinham sido apagadas.
export async function getStakesData(): Promise<{
    stakes: unknown[]
    points: number | null
    failed: boolean
}> {
    const token = await getAccessToken()
    if (!token) {
        // sem sessão não é falha: o middleware já redireciona quem não logou
        return { stakes: [], points: null, failed: false }
    }

    const headers = { Authorization: `Bearer ${token}` }

    const [stakesRes, pointsRes] = await Promise.allSettled([
        fetch(`${BACKEND_URL}/stakes`, { headers, cache: 'no-store' }),
        fetch(`${BACKEND_URL}/stakes/points`, { headers, cache: 'no-store' }),
    ])

    let stakes: unknown[] = []
    let failed = true
    if (stakesRes.status === 'fulfilled' && stakesRes.value.ok) {
        try {
            const data = await stakesRes.value.json()
            stakes = Array.isArray(data.stakes) ? data.stakes : []
            failed = false
        } catch {
            stakes = []
        }
    } else if (stakesRes.status === 'rejected') {
        console.error('Erro ao buscar fichas:', stakesRes.reason)
    } else {
        console.error('Erro ao buscar fichas:', stakesRes.value.status)
    }

    let points: number | null = null
    if (pointsRes.status === 'fulfilled' && pointsRes.value.ok) {
        try {
            const data = await pointsRes.value.json()
            points = typeof data.total === 'number' ? data.total : 0
        } catch {
            points = null
        }
    }

    return { stakes, points, failed }
}
