import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// POST /api/admin/seed/[id]/trocar-foto → pede ao backend outra foto do pool
// para o perfil semeado. Só repassa o token: quem decide se a conta é dona é
// o backend (404 para quem não é), e é lá que a service role mexe no Storage.
//
// Sem corpo e sem Content-Type de propósito: o Fastify responde 400 para
// `application/json` com body vazio, e a rota não precisa de nada além do id.
export async function POST(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const response = await fetch(
            `${BACKEND_URL}/admin/seed/profiles/${params.id}/trocar-foto`,
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            }
        )
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Erro ao trocar a foto do perfil semeado:', error)
        return NextResponse.json(
            { error: 'Erro ao trocar a foto' },
            { status: 500 }
        )
    }
}
