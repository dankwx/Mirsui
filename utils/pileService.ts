// utils/pileService.ts
//
// Dados da Pilha. Vêm do Observatório — o job diário que mede o catálogo no
// Deezer (mirsui-backend/src/jobs/catalogSnapshot.ts).
//
// Este arquivo era um mock: 74 faixas fixas no código, com "salvos" e "dias"
// derivados de um hash do nome da faixa. Funcionou enquanto a página ficou
// fechada, mas era o que impedia abri-la ao público — número inventado em
// página aberta é outra coisa.
//
// A seleção, o terço de calor e a deduplicação por gravação estão na RPC
// `get_pile_tracks` (mirsui-backend/migrations/013_pilha_real.sql), e não aqui,
// porque envolvem window function sobre o catálogo inteiro. Aqui só sobra montar
// a URL da capa e cachear.

import 'server-only'
import { unstable_cache } from 'next/cache'
import { supabasePublic } from '@/utils/supabase/public'
import type { PileHeat, PileTrack } from './pileTypes'

/** O Observatório mede 1x por dia; meia hora de atraso na pilha é irrelevante. */
const REVALIDAR_SEGUNDOS = 1800

/** Quantas faixas por gênero. 6 × 28 gêneros ≈ 168 peças no mosaico. */
const POR_GENERO = 6

interface PileRow {
    id?: string
    spotify_id?: string | null
    title?: string
    artist?: string
    md5?: string | null
    genre?: string
    heat?: string
    audiencia?: number
}

/**
 * A capa é montada a partir do md5 em vez de guardarmos a URL: o CDN do Deezer
 * serve qualquer tamanho a partir do mesmo hash, e a pilha usa dois (250 nas
 * peças pequenas, que são a maioria, e 500 nas grandes).
 */
function coverUrl(md5: string, px: 250 | 500) {
    return `https://cdn-images.dzcdn.net/images/cover/${md5}/${px}x${px}-000000-80-0-0.jpg`
}

function isHeat(v: unknown): v is PileHeat {
    return v === 'topo' || v === 'meio' || v === 'subsolo'
}

const buscar = unstable_cache(
    async (): Promise<PileTrack[]> => {
        const { data, error } = await supabasePublic.rpc('get_pile_tracks', {
            p_por_genero: POR_GENERO,
        })

        if (error) {
            console.error('[pilha] falha ao carregar o Observatório:', error.message)
            return []
        }

        const linhas = Array.isArray(data) ? (data as PileRow[]) : []

        return linhas.flatMap((r) => {
            if (!r.id || !r.title || !r.artist || !isHeat(r.heat)) return []
            return [
                {
                    id: r.id,
                    spotifyId: r.spotify_id || null,
                    title: r.title,
                    artist: r.artist,
                    cover: r.md5 ? coverUrl(r.md5, 500) : null,
                    coverSmall: r.md5 ? coverUrl(r.md5, 250) : null,
                    genre: r.genre || 'outros',
                    heat: r.heat,
                    audiencia: Number(r.audiencia) || 0,
                },
            ]
        })
    },
    ['pilha-observatorio'],
    { revalidate: REVALIDAR_SEGUNDOS, tags: ['observatorio'] }
)

/** Devolve lista vazia se a consulta falhar; a página trata esse caso. */
export async function getPileTracks(): Promise<PileTrack[]> {
    return buscar()
}
