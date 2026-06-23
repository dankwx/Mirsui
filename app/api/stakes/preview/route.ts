import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// GET /api/stakes/preview?isrc=&artist=&title= → prévia do multiplicador (via Deezer)
export async function GET(request: NextRequest) {
    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const qs = new URLSearchParams()
        for (const key of ['isrc', 'artist', 'title']) {
            const v = searchParams.get(key)
            if (v) qs.set(key, v)
        }
        const response = await fetch(`${BACKEND_URL}/stakes/preview?${qs.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Erro na prévia do stake:', error)
        return NextResponse.json({ error: 'Erro na prévia' }, { status: 500 })
    }
}
