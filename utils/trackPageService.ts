// utils/trackPageService.ts
//
// Monta a página de faixa a partir do ISRC.
//
// O desenho tem uma regra só: **nada de terceiro pode apagar dado que já é
// nosso.** Até 15/08/2026 a página inteira era derivada de uma linha —
// `fetchSpotifyTrackInfo(trackId)` — e quando ela devolvia null não existia
// plano B: sumia a capa, o artista, a ficha técnica e até a curva do
// Observatório, que é medida por nós e não depende de API nenhuma para existir.
//
// Aqui as duas fontes são consultadas em paralelo e se completam:
//
//   Deezer          uma requisição sem chave devolve título, artista, álbum,
//                   capa, duração, explícito, data, rank e a prévia de 30 s
//   observed_tracks título, artista, capa, gênero e rank que o Observatório já
//                   mediu — em casa, sem requisição nenhuma
//
// Se o Deezer estiver em quota, sobra o que é nosso e a página fica de pé.

import 'server-only'
import { cache } from 'react'
import {
    fetchDeezerTrackByISRC,
    fetchDeezerAlbumGenres,
    fetchDeezerArtist,
    coverFromMd5,
} from '@/utils/deezerService'
import { buscarFaixaObservada } from '@/utils/trackIdentity'
import { popScore } from '@/utils/popScore'

export interface ArtistaDaPagina {
    /** null quando só temos o nome (fallback local): vira texto, não link */
    id: string | null
    name: string
}

export interface DadosDaFaixa {
    isrc: string
    deezerTrackId: string | null
    title: string
    artists: ArtistaDaPagina[]
    /** já pronto para exibir: "Artista A, Artista B" */
    artistNames: string
    albumName: string | null
    coverUrl: string | null
    releaseDate: string | null
    /** segundos (o Deezer conta em segundos; o Spotify contava em ms) */
    duration: number
    explicit: boolean
    genres: string[] | null
    /** `nb_fan` do Deezer — quem favoritou o artista */
    followers: number | null
    /** 0-100 por popScore(rank): a MESMA escala da curva logo abaixo na página */
    popularity: number | null
    /** MP3 de 30 s, assinado e de vida curta. Nunca gravar no banco. */
    previewUrl: string | null
    /** camada 1 do "ouvir no Spotify": id que o job já pagou. Pode ser null. */
    spotifyTrackId: string | null
    /** de onde veio o grosso do que está na tela */
    fonte: 'deezer' | 'observatorio'
}

/**
 * A ficha completa de uma gravação. Devolve null só quando nem o Deezer nem o
 * Observatório conhecem o ISRC — e aí a rota responde 404 de verdade, em vez de
 * renderizar "Faixa Desconhecida" com 200.
 *
 * `cache()` do React: `generateMetadata` e o componente da página pedem a mesma
 * faixa no mesmo request, e sem isso seriam duas montagens completas.
 */
export const carregarFaixaPorIsrc = cache(async function carregarFaixaPorIsrc(
    isrc: string
): Promise<DadosDaFaixa | null> {
    const [doDeezer, local] = await Promise.all([
        fetchDeezerTrackByISRC(isrc),
        buscarFaixaObservada(isrc),
    ])

    if (!doDeezer && !local) return null

    // O gênero do Observatório JÁ é o do Deezer: vem do chart de onde a faixa
    // entrou. Quando ele existe, a requisição a /album/{id} não acontece — o
    // caminho comum da página fica em uma única chamada ao Deezer.
    const generoLocal = local?.genre?.trim() || null
    const artistaPrincipal = doDeezer?.artists[0]?.id ?? null

    const [generosDoAlbum, artista] = await Promise.all([
        !generoLocal && doDeezer?.albumId
            ? fetchDeezerAlbumGenres(doDeezer.albumId)
            : Promise.resolve(null),
        artistaPrincipal
            ? fetchDeezerArtist(artistaPrincipal)
            : Promise.resolve(null),
    ])

    const artists: ArtistaDaPagina[] = doDeezer?.artists.length
        ? doDeezer.artists
        : local
          ? [{ id: local.deezerArtistId, name: local.artistName }]
          : []

    const coverUrl =
        doDeezer?.coverUrl ??
        (local?.coverMd5 ? coverFromMd5(local.coverMd5, 1000) : null)

    const popularity = doDeezer
        ? popScore(doDeezer.rank)
        : (local?.lastPopularity ?? null)

    return {
        isrc,
        deezerTrackId: doDeezer?.deezerId ?? local?.deezerTrackId ?? null,
        title: doDeezer?.title ?? local?.title ?? 'Faixa',
        artists,
        artistNames:
            artists.map((a) => a.name).join(', ') || 'Artista Desconhecido',
        albumName: doDeezer?.albumName ?? local?.albumName ?? null,
        coverUrl,
        releaseDate: doDeezer?.releaseDate ?? null,
        duration: doDeezer?.duration ?? 0,
        explicit: doDeezer?.explicit ?? false,
        genres: generoLocal ? [generoLocal] : generosDoAlbum,
        followers: artista?.nbFan ?? null,
        popularity,
        previewUrl: doDeezer?.previewUrl ?? null,
        spotifyTrackId: local?.spotifyTrackId ?? null,
        fonte: doDeezer ? 'deezer' : 'observatorio',
    }
})

/**
 * O caminho legado: um id do Spotify que não deu para converter em ISRC nem
 * pela ponte do job, nem pelo acervo, nem perguntando ao Spotify.
 *
 * Não chama API nenhuma. O que sobra é o que o acervo guardou no momento em que
 * alguém salvou a faixa — título, artista, capa e a URL de origem. É pouco, mas
 * é nosso e não some quando um terceiro limita a taxa. Sem nem isso, a rota
 * responde 404 em vez de servir "Faixa Desconhecida" com status 200 para o
 * crawler.
 */
export async function carregarFaixaLegada(
    spotifyId: string
): Promise<DadosDaFaixa | null> {
    const { supabasePublic } = await import('@/utils/supabase/public')

    const { data } = await supabasePublic
        .from('tracks')
        .select('track_title, artist_name, album_name, track_thumbnail')
        .eq('track_uri', `spotify:track:${spotifyId}`)
        .limit(1)
        .maybeSingle()

    const linha = data as {
        track_title?: string
        artist_name?: string
        album_name?: string
        track_thumbnail?: string
    } | null

    if (!linha?.track_title || !linha.artist_name) return null

    return {
        isrc: '',
        deezerTrackId: null,
        title: linha.track_title,
        artists: [{ id: null, name: linha.artist_name }],
        artistNames: linha.artist_name,
        albumName: linha.album_name ?? null,
        coverUrl: linha.track_thumbnail ?? null,
        releaseDate: null,
        duration: 0,
        explicit: false,
        genres: null,
        followers: null,
        popularity: null,
        previewUrl: null,
        spotifyTrackId: spotifyId,
        fonte: 'observatorio',
    }
}
