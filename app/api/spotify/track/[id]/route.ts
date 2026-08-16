// app/api/spotify/track/[id]/route.ts
//
// Esta rota devolvia o JSON cru da API do Spotify para um id de faixa. Não
// sobrou nada dela: era um repasse direto de `/v1/tracks/{id}`, ou seja, exatamente
// o endpoint que respondeu 429 com Retry-After de 3h24 na sondagem de
// 15/08/2026 — e nada no site a chamava.
//
// Vira redirecionamento em vez de sumir: pode haver algo lá fora apontando para
// cá, e um 308 para o endereço canônico é uma resposta melhor que um 404. Quem
// chegar aqui cai em /track/<id>, que reconhece o formato do id, resolve o ISRC
// localmente e redireciona de novo para a forma canônica.
//
// Ver docs/plano-independencia-do-spotify.md, fase 5.

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const trackId = (params.id || '').trim()

    if (!trackId) {
        return NextResponse.json(
            { error: 'Track ID é obrigatório' },
            { status: 400 }
        )
    }

    return NextResponse.redirect(
        new URL(`/track/${encodeURIComponent(trackId)}`, request.url),
        308
    )
}
