import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

// O backend aceita corpo de até 8MB em base64, o que dá ~6MB de arquivo cru.
// Cortamos em 5MB aqui para a mensagem de erro ser nossa, não um 413 seco.
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
])

// POST /api/profiles/[id]/avatar → repassa a imagem para o backend, que faz o
// upload no Storage com a service role.
//
// Antes o navegador subia direto no bucket com a anon key. Funcionava porque o
// Storage aceitava escrita anônima — ou seja, qualquer pessoa sem login podia
// sobrescrever a foto de qualquer usuário, já que o caminho é previsível
// (<uuid>/profile-picture). Ver migrations/016_storage_fechado.sql no backend.
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = await getAccessToken()
    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    try {
        const form = await request.formData()
        const file = form.get('file')

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: 'Imagem é obrigatória' },
                { status: 400 }
            )
        }
        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json(
                { error: 'Formato inválido. Use JPG, PNG, WEBP ou GIF.' },
                { status: 400 }
            )
        }
        if (file.size > MAX_BYTES) {
            return NextResponse.json(
                { error: 'A imagem deve ter no máximo 5MB.' },
                { status: 400 }
            )
        }

        const image_base64 = Buffer.from(await file.arrayBuffer()).toString(
            'base64'
        )

        const response = await fetch(
            `${BACKEND_URL}/profiles/${params.id}/avatar`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ image_base64, content_type: file.type }),
                cache: 'no-store',
            }
        )
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Erro ao enviar a foto de perfil:', error)
        return NextResponse.json(
            { error: 'Erro ao enviar a foto' },
            { status: 500 }
        )
    }
}
