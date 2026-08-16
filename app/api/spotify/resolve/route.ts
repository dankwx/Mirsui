// app/api/spotify/resolve/route.ts
//
// Camada 2 do "ouvir no Spotify": resolução preguiçosa de ISRC -> id do
// Spotify (ver docs/plano-independencia-do-spotify.md §5).
//
// Só repassa. Quem consulta o Spotify e grava é o backend, porque a gravação
// precisa de service role — e porque a alternativa (uma RPC que aceite
// `spotify_track_id` vindo do navegador) seria uma porta aberta para apontar o
// botão de qualquer faixa para qualquer outra. É a mesma lição da migration
// 017, quando o cache do YouTube deixou de aceitar troca de vídeo por quem não
// fez a busca.
//
// Este endpoint nunca está no caminho de render: a página já pintou quando o
// navegador chega aqui, e falhar significa manter o deep link de busca.

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'
const ISRC_RE = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/

export async function POST(request: NextRequest) {
    let isrc: string
    try {
        const body = await request.json()
        isrc = String(body?.isrc ?? '')
            .trim()
            .toUpperCase()
    } catch {
        return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
    }

    if (!ISRC_RE.test(isrc)) {
        return NextResponse.json({ error: 'ISRC inválido' }, { status: 400 })
    }

    try {
        const res = await fetch(`${BACKEND_URL}/tracks/resolve-spotify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isrc }),
            cache: 'no-store',
        })

        if (!res.ok) {
            // 429 do Spotify, backend fora do ar, o que for: para o botão isso
            // é a mesma coisa que "ainda não sei", e ele segue na camada 3.
            return NextResponse.json({ spotifyTrackId: null })
        }

        const data = await res.json()
        return NextResponse.json({
            spotifyTrackId: data?.spotifyTrackId ?? null,
        })
    } catch {
        return NextResponse.json({ spotifyTrackId: null })
    }
}
