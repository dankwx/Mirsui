// app/api/previa/[id]/route.ts
//
// A prévia de 30 s de uma gravação, pedida no play e não na visita.
//
// A página de faixa sai do banco desde 22/09/2026 (ver utils/trackPageService.ts)
// e a única coisa que o banco não pode guardar é esta: a URL do MP3 vem
// assinada com `hdnea=exp=` e vence em poucas horas — uma lida ~2h30 antes já
// estava vencida. Então a página guarda só SE a prévia existe, e o player chama
// esta rota quando alguém aperta play. Uma chamada ao Deezer por play de
// verdade, e não por visita: robô não aperta play, e é o robô que percorre as
// 100 mil páginas que o cache não protege.
//
// Responde com um redirecionamento para o MP3, e não com JSON, por causa do
// Safari: `audio.play()` só vale dentro do gesto do usuário, e esperar um
// `fetch` antes de tocar perde o gesto. Com o redirecionamento o player põe
// esta URL no `<audio>` e toca no mesmo clique; quem segue o 302 é o navegador.
//
// O endereço é o id do Deezer, e não o ISRC: o mesmo ISRC pode apontar para
// outra versão da gravação no Deezer (~10% no teste de 22/09), e a prévia tem
// que ser a da faixa que a página mostra.

import { NextResponse } from 'next/server'
import { fetchDeezerTrackById } from '@/utils/deezerService'

export const dynamic = 'force-dynamic'

/** O MP3 só pode vir do CDN do Deezer: esta rota não é um redirecionador aberto. */
function previaConfiavel(url: string): boolean {
    try {
        const u = new URL(url)
        return u.protocol === 'https:' && u.hostname.endsWith('.dzcdn.net')
    } catch {
        return false
    }
}

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id
    if (!/^\d{1,20}$/.test(id)) {
        return new NextResponse(null, { status: 404 })
    }

    // Passa pelo gateway como qualquer chamada do site: mesma cota, mesma
    // pausa, e a mesma janela de 15 min (REVALIDAR_FAIXA) — dois plays da
    // mesma faixa nesse intervalo custam uma requisição só.
    const faixa = await fetchDeezerTrackById(id)
    const url = faixa?.previewUrl

    if (!url || !previaConfiavel(url)) {
        // Sem prévia ou Deezer fora: não guardar, porque os dois passam.
        return new NextResponse(null, {
            status: 404,
            headers: { 'cache-control': 'no-store' },
        })
    }

    return new NextResponse(null, {
        status: 302,
        headers: {
            location: url,
            // Curto e só no navegador: o player e a leitura da forma de onda
            // pedem a mesma URL, e a assinatura vale horas, não dias.
            'cache-control': 'private, max-age=300',
        },
    })
}
