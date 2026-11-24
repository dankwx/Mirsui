import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// As ações do painel de saltos, repassadas ao backend com o token da sessão:
//
//   POST   /api/admin/saltos/notas       publica a nota de um ou mais saltos
//   PATCH  /api/admin/saltos/notas/:id   edita
//   DELETE /api/admin/saltos/notas/:id   tira do ar (os saltos voltam à fila)
//   POST   /api/admin/saltos/status      ignora ou devolve à fila
//
// Quem decide se a conta é dona é o backend (404 para quem não é). Aqui só
// passa o que está nesta lista, para a rota não virar um proxy aberto.
const PERMITIDAS: { metodo: string; caminho: RegExp }[] = [
    { metodo: 'POST', caminho: /^notas$/ },
    { metodo: 'PATCH', caminho: /^notas\/\d+$/ },
    { metodo: 'DELETE', caminho: /^notas\/\d+$/ },
    { metodo: 'POST', caminho: /^status$/ },
]

async function repassar(
    request: NextRequest,
    { params }: { params: { caminho: string[] } }
) {
    const caminho = params.caminho.join('/')
    const metodo = request.method
    if (
        !PERMITIDAS.some((p) => p.metodo === metodo && p.caminho.test(caminho))
    ) {
        return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }

    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 })
    }

    // DELETE vai sem corpo e sem Content-Type: o Fastify responde 400 para
    // `application/json` com body vazio.
    const corpo = metodo === 'DELETE' ? undefined : await request.text()

    try {
        const res = await fetch(`${BACKEND_URL}/admin/saltos/${caminho}`, {
            method: metodo,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(corpo ? { 'Content-Type': 'application/json' } : {}),
            },
            body: corpo || undefined,
            cache: 'no-store',
        })
        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        console.error('Erro ao repassar ação do painel de saltos:', error)
        return NextResponse.json(
            { error: 'O backend não respondeu.' },
            { status: 502 }
        )
    }
}

export { repassar as POST, repassar as PATCH, repassar as DELETE }
