// utils/artistPageService.ts
//
// A página de artista, montada a partir do Deezer.
//
// POR QUE ELA PRECISAVA MUDAR
// Ela era 100% Spotify, e a seção principal — "Músicas Mais Populares" — usava
// `/artists/{id}/top-tracks`, que responde **403** desde abril e não tem nada a
// ver com rate limit: o endpoint foi restringido na plataforma inteira. Ou
// seja, aquela parte do site já estava quebrada, calada, havia meses.
//
// O equivalente do Deezer não só funciona como devolve mais: `/artist/{id}/top`
// aceita até 99 faixas por requisição (contra 10 do Spotify) e cada uma vem com
// `rank`, que é a mesma métrica do Observatório e dos Stakes.
//
// FORMA DE SAÍDA
// Os componentes de components/Artist/* são quase todos `any`-tipados e falam o
// vocabulário do Spotify (`album_type`, `duration_ms`, `followers.total`).
// Traduzir aqui, num lugar só, é muito menos arriscado que reescrever sete
// componentes de tela — e deixa a fronteira explícita: daqui para baixo é
// Deezer, daqui para cima é a forma que a tela já sabe desenhar.

import 'server-only'
import { cache } from 'react'
import { supabasePublic } from '@/utils/supabase/public'
import {
    fetchDeezerArtist,
    fetchDeezerArtistTopTracks,
    fetchDeezerArtistAlbums,
    type FaixaDeezer,
    type AlbumDeezer,
} from '@/utils/deezerService'
import { popScore } from '@/utils/popScore'

/** A faixa como os componentes de artista já esperam. */
export interface FaixaDaVitrine {
    id: string
    name: string
    /** chave opaca da gravação */
    uri: string
    /** rota interna já pronta — os componentes não montam mais URL na mão */
    href: string | null
    /** onde ouvir fora daqui */
    externalUrl: string
    duration_ms: number
    popularity: number
    artists: { id: string | null; name: string }[]
    album: {
        id: string
        name: string
        images: { url: string }[]
        release_date: string
        album_type: string
    }
}

/** O álbum como as abas de discografia já esperam. */
export interface AlbumDaVitrine {
    id: string
    name: string
    album_type: 'album' | 'single' | 'compilation'
    images: { url: string }[]
    release_date: string
    total_tracks: number
    artists: { id: string | null; name: string }[]
    external_urls: { spotify: string }
}

export interface ArtistaDaVitrine {
    id: string
    name: string
    images: { url: string }[]
    /** `nb_fan` do Deezer, no campo que a tela já lê */
    followers: { total: number }
    genres: string[]
    /** 0-100 derivado do rank das faixas mais tocadas */
    popularity: number
    external_urls: { spotify: string }
}

export interface PaginaDoArtista {
    artista: ArtistaDaVitrine
    topTracks: FaixaDaVitrine[]
    albuns: AlbumDaVitrine[]
}

/**
 * `record_type` do Deezer nas três gavetas que as abas mostram. 'ep' cai em
 * single porque é o que o Spotify sempre fez (ele não distingue EP), e manter
 * uma quarta aba com um ou dois itens não ajudaria ninguém.
 */
function tipoDoAlbum(recordType: string): 'album' | 'single' | 'compilation' {
    if (recordType === 'compile' || recordType === 'compilation') return 'compilation'
    if (recordType === 'single' || recordType === 'ep') return 'single'
    return 'album'
}

function faixaParaVitrine(
    f: FaixaDeezer,
    isrcConhecido?: string | null
): FaixaDaVitrine {
    const isrc = f.isrc || isrcConhecido || null
    return {
        id: f.deezerId,
        name: f.title,
        uri: isrc ? `isrc:${isrc}` : `deezer:track:${f.deezerId}`,
        // O ISRC é o endereço canônico; o id do Deezer também abre (a rota
        // redireciona), então nenhuma faixa fica sem link.
        href: `/track/${isrc || f.deezerId}`,
        externalUrl: `https://www.deezer.com/track/${f.deezerId}`,
        duration_ms: f.duration * 1000,
        popularity: popScore(f.rank),
        artists: f.artists.map((a) => ({ id: a.id, name: a.name })),
        album: {
            id: f.albumId || '',
            name: f.albumName || '',
            images: f.coverUrl ? [{ url: f.coverUrl }] : [],
            release_date: f.releaseDate || '',
            album_type: 'album',
        },
    }
}

function albumParaVitrine(
    a: AlbumDeezer,
    dono: { id: string; name: string }
): AlbumDaVitrine {
    return {
        id: a.id,
        name: a.title,
        album_type: tipoDoAlbum(a.recordType),
        images: a.coverUrl ? [{ url: a.coverUrl }] : [],
        release_date: a.releaseDate || '',
        total_tracks: a.nbTracks,
        // `/artist/{id}/albums` não repete o artista em cada item — é sempre o
        // dono da página. Preencher aqui evita `undefined` na tela.
        artists: [dono],
        // A chave continua se chamando `spotify` porque é o nome do campo no
        // formato que os componentes leem. O valor é o link do Deezer, que é
        // onde a página existe de verdade agora.
        external_urls: { spotify: `https://www.deezer.com/album/${a.id}` },
    }
}

/**
 * ISRC das faixas que o Observatório já conhece, por id do Deezer. Uma consulta
 * local, sem chamada externa nenhuma — é dado que já é nosso.
 */
async function buscarIsrcsLocais(
    deezerTrackIds: string[]
): Promise<Map<string, string>> {
    const mapa = new Map<string, string>()
    if (deezerTrackIds.length === 0) return mapa

    const { data, error } = await supabasePublic
        .from('observed_tracks')
        .select('deezer_track_id, isrc')
        .in('deezer_track_id', deezerTrackIds)
        .not('isrc', 'is', null)

    if (error) {
        // Sem isto os links caem no id do Deezer, que também abre. Não é razão
        // para a página inteira falhar.
        console.error('[artista] falha ao ler ISRCs locais:', error.message)
        return mapa
    }

    for (const l of (data ?? []) as { deezer_track_id: string; isrc: string }[]) {
        mapa.set(l.deezer_track_id, l.isrc)
    }
    return mapa
}

/**
 * Tudo que a página de artista precisa, em três requisições paralelas ao
 * Deezer. Nenhuma delas precisa de chave.
 *
 * Devolve null quando o artista não existe — e aí a rota responde 404, em vez
 * de desenhar um perfil vazio com "Artista Verificado" no topo.
 */
export const carregarArtista = cache(async function carregarArtista(
    deezerArtistId: string
): Promise<PaginaDoArtista | null> {
    const [artista, top, albuns] = await Promise.all([
        fetchDeezerArtist(deezerArtistId),
        fetchDeezerArtistTopTracks(deezerArtistId, 99),
        fetchDeezerArtistAlbums(deezerArtistId, 100),
    ])

    if (!artista) return null

    // `/artist/{id}/top` é o único endpoint do Deezer usado aqui que NÃO traz
    // ISRC (medido: /search traz, /album/{id}/tracks traz, este não). Sem ele
    // cada link da lista apontaria para o id do Deezer e pagaria um
    // redirecionamento extra a cada clique.
    //
    // O conserto não custa requisição nenhuma: o Observatório mede essas faixas
    // por id do Deezer todo dia e guarda o ISRC ao lado. É uma consulta local
    // para a lista inteira.
    const isrcPorDeezerId = await buscarIsrcsLocais(top.map((t) => t.deezerId))

    const topTracks = top.map((t) =>
        faixaParaVitrine(t, isrcPorDeezerId.get(t.deezerId))
    )

    // A "popularidade do artista" do Spotify não tem equivalente no Deezer, e
    // inventar um número seria a mesma doença dos "Nº 042" que saíram da
    // /track. O que existe é medível: a audiência média das faixas mais
    // tocadas dele, na escala que o resto do site já usa.
    const popularity =
        topTracks.length > 0
            ? Math.round(
                  topTracks.reduce((s, t) => s + t.popularity, 0) /
                      topTracks.length
              )
            : 0

    return {
        artista: {
            id: artista.id,
            name: artista.name,
            images: artista.pictureUrl ? [{ url: artista.pictureUrl }] : [],
            followers: { total: artista.nbFan },
            genres: [],
            popularity,
            external_urls: {
                spotify: `https://www.deezer.com/artist/${artista.id}`,
            },
        },
        topTracks,
        albuns: albuns.map((a) =>
            albumParaVitrine(a, { id: artista.id, name: artista.name })
        ),
    }
})
