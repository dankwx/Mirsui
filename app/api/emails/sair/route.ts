// Descadastro de um clique (RFC 8058): o alvo do List-Unsubscribe dos avisos.
//
// O Gmail e o Apple Mail mostram "Cancelar inscrição" no topo do e-mail e
// mandam um POST para cá, sem abrir página nenhuma. O GET só leva para a
// página de preferências, sem desligar nada: antivírus de e-mail abrem todo
// link que encontram, e um GET que desligasse o aviso desligaria sozinho.

import { NextResponse, type NextRequest } from 'next/server'
import { origemPublica } from '@/lib/site'
import { supabasePublic } from '@/utils/supabase/public'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function ler(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token')?.trim() ?? ''
    const tipo = request.nextUrl.searchParams.get('tipo')
    return {
        token: UUID.test(token) ? token.toLowerCase() : null,
        tipo: tipo === 'seguidor' || tipo === 'saltos' ? tipo : null,
    }
}

export async function POST(request: NextRequest) {
    const { token, tipo } = ler(request)
    if (!token || !tipo) {
        return NextResponse.json({ error: 'link inválido' }, { status: 400 })
    }

    const { data, error } = await supabasePublic.rpc('salvar_preferencias_pelo_token', {
        p_token: token,
        p_seguidor: tipo === 'seguidor' ? false : null,
        p_saltos: tipo === 'saltos' ? false : null,
    })
    if (error) {
        console.error('Descadastro de um clique:', error)
        return NextResponse.json({ error: 'não salvou' }, { status: 500 })
    }
    if (!Array.isArray(data) || data.length === 0) {
        return NextResponse.json({ error: 'link inválido' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
}

export async function GET(request: NextRequest) {
    const { token } = ler(request)
    const destino = new URL('/emails', origemPublica(request.headers))
    if (token) destino.searchParams.set('token', token)
    return NextResponse.redirect(destino, 303)
}
