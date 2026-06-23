import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// Busca stakes + total de pontos direto no backend, no servidor.
// Roda no render do server component, então os dados já chegam no HTML
// (sem esperar hidratação e sem o salto extra pelo proxy /api/stakes).
export async function getStakesData(): Promise<{
    stakes: unknown[]
    points: number | null
}> {
    const token = await getAccessToken()
    if (!token) {
        return { stakes: [], points: null }
    }

    const headers = { Authorization: `Bearer ${token}` }

    const [stakesRes, pointsRes] = await Promise.allSettled([
        fetch(`${BACKEND_URL}/stakes`, { headers, cache: 'no-store' }),
        fetch(`${BACKEND_URL}/stakes/points`, { headers, cache: 'no-store' }),
    ])

    let stakes: unknown[] = []
    if (stakesRes.status === 'fulfilled' && stakesRes.value.ok) {
        try {
            const data = await stakesRes.value.json()
            stakes = Array.isArray(data.stakes) ? data.stakes : []
        } catch {
            stakes = []
        }
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

    return { stakes, points }
}
