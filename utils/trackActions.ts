'use server'

import { getAccessToken } from '@/utils/supabase/get-access-token'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

type ActionResult<T = undefined> =
    | ({ success: true } & (T extends undefined ? {} : { data: T }))
    | { success: false; message: string }

export interface SaveTrackInput {
    trackUri: string
    trackName: string
    artistName: string
    albumName: string
    spotifyUrl: string
    trackThumbnail: string
    popularity: number
    claimMessage?: string
}

/**
 * Salva uma faixa no acervo do usuário.
 *
 * Vai pelo backend (e não direto no Supabase) porque salvar não é só inserir
 * uma linha: a posição depende de quantas pessoas já salvaram aquele track_uri
 * e o discover_rating deriva dela. Essa conta mora em tracks/claim.
 *
 * Sem contrapartida de "dessalvar": tirar um salvamento abriria buraco na
 * numeração de quem veio depois, e a posição é o registro de quem ouviu antes.
 */
export async function saveTrack(
    input: SaveTrackInput
): Promise<ActionResult<{ position: number | null }>> {
    const token = await getAccessToken()

    if (!token) {
        return { success: false, message: 'Você precisa estar logado para salvar.' }
    }

    if (!input.trackUri) {
        return { success: false, message: 'Faixa sem identificador; não dá para salvar.' }
    }

    try {
        const response = await fetch(`${BACKEND_URL}/tracks/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(input),
            cache: 'no-store',
        })

        const data = await response.json().catch(() => ({}))

        // 409 = já estava salva. Para quem clicou o resultado é o mesmo que
        // salvar agora, então é sucesso: o botão só estava desatualizado.
        if (response.status === 409) {
            return { success: true, data: { position: data.position ?? null } }
        }

        if (!response.ok) {
            console.error('Erro ao salvar faixa:', response.status, data?.error)
            return { success: false, message: data?.error || 'Não foi possível salvar.' }
        }

        return { success: true, data: { position: data.position ?? null } }
    } catch (error) {
        console.error('Erro ao salvar faixa:', error)
        return { success: false, message: 'Não foi possível salvar.' }
    }
}
