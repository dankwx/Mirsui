// app/api/search/route.ts
//
// A busca do site. Deezer primeiro, Spotify como reserva.
//
// POR QUE TROCOU
// A busca do Spotify (`/search?type=track,artist&market=BR`) foi um dos quatro
// endpoints que responderam 429 na sondagem de 15/08/2026, com Retry-After de
// 3h24 — ou seja, a caixa de busca do site parava de funcionar por horas. O
// Deezer responde sem chave, sem token e sem cota publicada.
//
// POR QUE O SPOTIFY FICOU DE RESERVA
// A busca é o único ponto deste plano onde a experiência pode piorar: a busca
// do Deezer não é a do Spotify. Então ela não some — vira o plano B para quando
// o Deezer não achar nada. Se o Spotify estiver fora (ou sem credencial), o
// resultado é o mesmo que seria sem ele: nenhum resultado, em vez de erro.
//
// A FORMA DA RESPOSTA NÃO MUDOU
// Continua `{ tracks: { items }, artists: { items } }` com os campos que os
// componentes já leem. O que mudou é o significado de `id`: agora é o ISRC da
// gravação (ou o id do Deezer, quando o ISRC não vier), que é o endereço da
// página. Antes era o id do Spotify — e gravação sem par no Spotify não
// aparecia na busca de um site cujo catálogo inteiro é medido no Deezer.

import { NextRequest, NextResponse } from 'next/server'
import {
    searchDeezerTracks,
    searchDeezerArtists,
    type FaixaDeezer,
    type ArtistaDeezer,
} from '@/utils/deezerService'
import { popScore } from '@/utils/popScore'

interface ItemDeFaixa {
    /** o que vai depois de /track/ — ISRC quando existe, id do Deezer se não */
    id: string
    name: string
    artists: { id: string | null; name: string }[]
    album: { name: string; images: { url: string }[] }
    /** em ms para não mexer nos formatadores que já existem */
    duration_ms: number
    /** 0-100, na mesma escala do Observatório e dos Stakes */
    popularity: number
    /** a chave opaca do acervo, se alguém salvar a faixa a partir da busca */
    uri: string
    isrc: string | null
    deezerId: string | null
    /** onde ouvir a faixa fora daqui */
    externalUrl: string
}

interface ItemDeArtista {
    id: string
    name: string
    images: { url: string }[]
    followers: { total: number }
    genres: string[]
}

function faixaParaItem(f: FaixaDeezer): ItemDeFaixa {
    return {
        id: f.isrc || f.deezerId,
        name: f.title,
        artists: f.artists.map((a) => ({ id: a.id, name: a.name })),
        album: {
            name: f.albumName || '',
            images: f.coverUrl ? [{ url: f.coverUrl }] : [],
        },
        duration_ms: f.duration * 1000,
        popularity: popScore(f.rank),
        uri: f.isrc ? `isrc:${f.isrc}` : `deezer:track:${f.deezerId}`,
        isrc: f.isrc,
        deezerId: f.deezerId,
        externalUrl: `https://www.deezer.com/track/${f.deezerId}`,
    }
}

function artistaParaItem(a: ArtistaDeezer): ItemDeArtista {
    return {
        id: a.id,
        name: a.name,
        images: a.pictureUrl ? [{ url: a.pictureUrl }] : [],
        followers: { total: a.nbFan },
        // O Deezer não expõe gênero no objeto do artista. O do Spotify vinha
        // vazio para BR/indie de qualquer jeito, então a interface já sabe
        // lidar com lista vazia — foi por isso que o fallback de gênero pelo
        // Deezer existe desde antes deste plano.
        genres: [],
    }
}

/**
 * O plano B. Import dinâmico: sem credencial do Spotify o módulo nem é
 * carregado, e é isso que faz o site inteiro subir com as envs vazias.
 */
async function reservaDoSpotify(
    query: string,
    type: string,
    limit: number
): Promise<{ tracks: ItemDeFaixa[]; artists: ItemDeArtista[] } | null> {
    const temCredencial =
        !!(process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID) &&
        !!(process.env.SPOTIFY_CLIENT_SECRET || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET)
    if (!temCredencial) return null

    try {
        const { searchSpotify } = await import('@/utils/spotifyService')
        const r = await searchSpotify(query, type, limit)
        if (!r) return null

        return {
            tracks: (r.tracks?.items ?? []).map((t) => ({
                // O id do Spotify continua sendo endereço válido: a rota
                // reconhece o formato e devolve 308 para a forma canônica.
                id: t.id,
                name: t.name,
                artists: (t.artists ?? []).map((a) => ({
                    id: null,
                    name: a.name,
                })),
                album: {
                    name: t.album?.name ?? '',
                    images: t.album?.images ?? [],
                },
                duration_ms: t.duration_ms,
                popularity: t.popularity,
                uri: t.uri,
                isrc: t.external_ids?.isrc ?? null,
                deezerId: null,
                externalUrl: `https://open.spotify.com/track/${t.id}`,
            })),
            // Artistas do Spotify ficam de fora de propósito: o id deles não
            // abre a página de artista, que passou a ser endereçada pelo
            // Deezer. Devolver o item daria um link para lugar nenhum.
            artists: [],
        }
    } catch {
        return null
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')
        const type = searchParams.get('type') || 'track,artist'
        const limit = Math.min(
            Math.max(parseInt(searchParams.get('limit') || '10', 10) || 10, 1),
            50
        )

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: 'Query de busca é obrigatória' },
                { status: 400 }
            )
        }

        // Evita buscas muito curtas que podem retornar muitos resultados irrelevantes
        if (query.trim().length < 2) {
            return NextResponse.json(
                { error: 'Query deve ter pelo menos 2 caracteres' },
                { status: 400 }
            )
        }

        const querFaixas = type.includes('track')
        const querArtistas = type.includes('artist')

        const [faixas, artistas] = await Promise.all([
            querFaixas ? searchDeezerTracks(query, limit) : Promise.resolve([]),
            querArtistas
                ? searchDeezerArtists(query, limit)
                : Promise.resolve([]),
        ])

        let itensDeFaixa = faixas.map(faixaParaItem)
        let itensDeArtista = artistas.map(artistaParaItem)

        // Só cai na reserva quando o Deezer não achou NADA do que foi pedido —
        // não quando achou pouco. Misturar as duas fontes numa lista só daria
        // duas entradas da mesma gravação, com ids diferentes e capas
        // diferentes, e o usuário não teria como saber que são a mesma faixa.
        const deezerVazio =
            (!querFaixas || itensDeFaixa.length === 0) &&
            (!querArtistas || itensDeArtista.length === 0)

        if (deezerVazio) {
            const reserva = await reservaDoSpotify(query, type, limit)
            if (reserva) {
                itensDeFaixa = reserva.tracks
                itensDeArtista = reserva.artists
            }
        }

        return NextResponse.json({
            tracks: { items: itensDeFaixa, total: itensDeFaixa.length },
            artists: { items: itensDeArtista, total: itensDeArtista.length },
        })
    } catch (error) {
        console.error('Erro na rota de busca:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
