// utils/deezerService.ts
//
// Cliente do Deezer para o site. API pública: sem chave, sem token, sem
// renovação, sem `market=`.
//
// Este arquivo era só um fallback de gênero — existia porque o `genres` do
// Spotify vem vazio para artista BR e indie. Virou a fonte primária de metadado
// (ver docs/plano-independencia-do-spotify.md): uma requisição a
// `/track/isrc:{isrc}` devolve título, artista, álbum, capa, duração, explícito,
// data, rank e a prévia de 30 s — tudo que a página de faixa lê, mais dois
// campos que o Spotify já não entrega.
//
// A ponte com o resto do sistema é o ISRC, que não é de plataforma nenhuma: é o
// código da gravação. `get_track_curve` já casa por ele, e a rota da página
// passou a ser endereçada por ele.

import 'server-only'

const BASE = 'https://api.deezer.com'

/**
 * A faixa é revalidada em 15 min, e não em 24 h como o resto, por causa da
 * prévia: a URL do MP3 vem assinada com `hdnea=exp=` e vale poucas horas.
 * Cachear a resposta por um dia entregaria um player mudo. Rank também se move,
 * então revalidar rápido só melhora o número.
 */
const REVALIDAR_FAIXA = 900
/** Gênero de álbum não muda. */
const REVALIDAR_ALBUM = 86400
/** Nº de fãs muda devagar; um dia de atraso é invisível. */
const REVALIDAR_ARTISTA = 86400
/** Busca é fluxo de usuário: 5 min é cache o bastante para o typeahead. */
const REVALIDAR_BUSCA = 300

/* ------------------------------------------------------------ forma da API */

interface DeezerErro {
    code?: number
    message?: string
}

interface DeezerArtistaBruto {
    id?: number
    name?: string
    picture_xl?: string
    picture_big?: string
    picture_medium?: string
    md5_image?: string
    nb_fan?: number
    nb_album?: number
    error?: DeezerErro
}

interface DeezerAlbumBruto {
    id?: number
    title?: string
    cover_xl?: string
    cover_big?: string
    cover_medium?: string
    md5_image?: string
    release_date?: string
    record_type?: string
    nb_tracks?: number
    genres?: { data?: { name?: string }[] }
    artist?: DeezerArtistaBruto
    error?: DeezerErro
}

interface DeezerFaixaBruta {
    id?: number
    title?: string
    title_short?: string
    isrc?: string
    duration?: number
    rank?: number
    explicit_lyrics?: boolean
    preview?: string
    release_date?: string
    artist?: DeezerArtistaBruto
    album?: DeezerAlbumBruto
    contributors?: DeezerArtistaBruto[]
    error?: DeezerErro
}

interface DeezerLista<T> {
    data?: T[]
    total?: number
    error?: DeezerErro
}

async function dz<T>(path: string, revalidate: number): Promise<T | null> {
    try {
        const res = await fetch(`${BASE}${path}`, { next: { revalidate } })
        if (!res.ok) return null
        const data = (await res.json()) as T & { error?: DeezerErro }
        // O Deezer responde 200 com `error` no corpo para faixa inexistente
        // (code 800) e para quota estourada (code 4). Os dois viram null aqui;
        // quem chama trata os dois do mesmo jeito, que é não mostrar o bloco.
        if (data && data.error) return null
        return data
    } catch {
        return null
    }
}

/* ------------------------------------------------------------ normalização */

/**
 * O CDN do Deezer serve qualquer tamanho a partir do md5 da capa — é o mesmo
 * truque que a Pilha usa para montar 504 imagens numa página sem guardar URL
 * nenhuma (ver utils/pileService.ts).
 */
export function coverFromMd5(md5: string, px: 250 | 500 | 1000): string {
    return `https://cdn-images.dzcdn.net/images/cover/${md5}/${px}x${px}-000000-80-0-0.jpg`
}

export function artistPicFromMd5(md5: string, px: 250 | 500 | 1000): string {
    return `https://cdn-images.dzcdn.net/images/artist/${md5}/${px}x${px}-000000-80-0-0.jpg`
}

export interface ArtistaDaFaixa {
    id: string
    name: string
}

/** A faixa como a página lê — sem nada da forma crua do Deezer vazando. */
export interface FaixaDeezer {
    deezerId: string
    isrc: string | null
    title: string
    /** principal + participações (`contributors`), na ordem que o Deezer manda */
    artists: ArtistaDaFaixa[]
    albumId: string | null
    albumName: string | null
    coverUrl: string | null
    /** segundos */
    duration: number
    explicit: boolean
    releaseDate: string | null
    /** número cru do Deezer (~60k obscuro, ~1M hit) */
    rank: number
    /** MP3 de 30 s, URL assinada e de vida curta — nunca gravar no banco */
    previewUrl: string | null
}

function normalizarFaixa(t: DeezerFaixaBruta): FaixaDeezer | null {
    if (t.id == null) return null
    const titulo = t.title || t.title_short
    if (!titulo) return null

    // `contributors` traz o artista principal na primeira posição e as
    // participações depois. Quando ele não vem (busca, top), sobra `artist`.
    const brutos =
        t.contributors && t.contributors.length > 0
            ? t.contributors
            : t.artist
              ? [t.artist]
              : []

    const artists = brutos.flatMap((a) =>
        a.id != null && a.name ? [{ id: String(a.id), name: a.name }] : []
    )

    const md5 = t.album?.md5_image
    const coverUrl =
        t.album?.cover_xl ||
        t.album?.cover_big ||
        (md5 ? coverFromMd5(md5, 1000) : null) ||
        null

    return {
        deezerId: String(t.id),
        isrc: t.isrc ?? null,
        title: titulo,
        artists,
        albumId: t.album?.id != null ? String(t.album.id) : null,
        albumName: t.album?.title ?? null,
        coverUrl,
        duration: Number(t.duration) || 0,
        explicit: !!t.explicit_lyrics,
        releaseDate: t.release_date || t.album?.release_date || null,
        rank: Number(t.rank) || 0,
        previewUrl: t.preview || null,
    }
}

/* ------------------------------------------------------------------ faixas */

/**
 * A requisição que substitui a página inteira. Uma chamada, sem chave.
 * `/track/isrc:{isrc}` devolve a gravação exata — casamento por identificador,
 * não por texto.
 */
export async function fetchDeezerTrackByISRC(
    isrc: string
): Promise<FaixaDeezer | null> {
    if (!isrc) return null
    const t = await dz<DeezerFaixaBruta>(
        `/track/isrc:${encodeURIComponent(isrc)}`,
        REVALIDAR_FAIXA
    )
    return t ? normalizarFaixa(t) : null
}

/** Mesma ficha, pelo id do Deezer. Usada só na rota de escape `/track/<dígitos>`. */
export async function fetchDeezerTrackById(
    deezerId: string
): Promise<FaixaDeezer | null> {
    if (!deezerId) return null
    const t = await dz<DeezerFaixaBruta>(
        `/track/${encodeURIComponent(deezerId)}`,
        REVALIDAR_FAIXA
    )
    return t ? normalizarFaixa(t) : null
}

/* ------------------------------------------------------------------ álbuns */

/**
 * Gêneros do álbum. Ex.: ["Rap/Hip Hop"].
 *
 * O gênero mora no álbum no Deezer, não na faixa — por isso é a única segunda
 * requisição que a página de faixa faz.
 */
export async function fetchDeezerAlbumGenres(
    albumId: string
): Promise<string[] | null> {
    if (!albumId) return null
    const album = await dz<DeezerAlbumBruto>(
        `/album/${encodeURIComponent(albumId)}`,
        REVALIDAR_ALBUM
    )
    const nomes = album?.genres?.data
        ?.map((g) => g.name)
        .filter((n): n is string => !!n)
    return nomes && nomes.length > 0 ? nomes : null
}

/* ---------------------------------------------------------------- artistas */

export interface ArtistaDeezer {
    id: string
    name: string
    pictureUrl: string | null
    /** o equivalente honesto de "seguidores": quem favoritou o artista */
    nbFan: number
    nbAlbum: number
}

function normalizarArtista(a: DeezerArtistaBruto): ArtistaDeezer | null {
    if (a.id == null || !a.name) return null
    const md5 = a.md5_image
    return {
        id: String(a.id),
        name: a.name,
        pictureUrl:
            a.picture_xl ||
            a.picture_big ||
            (md5 ? artistPicFromMd5(md5, 500) : null) ||
            null,
        nbFan: Number(a.nb_fan) || 0,
        nbAlbum: Number(a.nb_album) || 0,
    }
}

export async function fetchDeezerArtist(
    artistId: string
): Promise<ArtistaDeezer | null> {
    if (!artistId) return null
    const a = await dz<DeezerArtistaBruto>(
        `/artist/${encodeURIComponent(artistId)}`,
        REVALIDAR_ARTISTA
    )
    return a ? normalizarArtista(a) : null
}

/**
 * As faixas mais tocadas do artista, com rank. O equivalente do Spotify
 * (`/artists/{id}/top-tracks`) responde 403 desde abril; este não só funciona
 * como devolve 99 em vez de 10.
 */
export async function fetchDeezerArtistTopTracks(
    artistId: string,
    limite = 50
): Promise<FaixaDeezer[]> {
    if (!artistId) return []
    const safe = Math.min(99, Math.max(1, Math.floor(limite)))
    const res = await dz<DeezerLista<DeezerFaixaBruta>>(
        `/artist/${encodeURIComponent(artistId)}/top?limit=${safe}`,
        REVALIDAR_ARTISTA
    )
    return (res?.data ?? []).flatMap((t) => {
        const f = normalizarFaixa(t)
        return f ? [f] : []
    })
}

export interface AlbumDeezer {
    id: string
    title: string
    coverUrl: string | null
    releaseDate: string | null
    /** 'album' | 'single' | 'ep' | 'compile' — vocabulário do Deezer */
    recordType: string
    nbTracks: number
}

export async function fetchDeezerArtistAlbums(
    artistId: string,
    limite = 100
): Promise<AlbumDeezer[]> {
    if (!artistId) return []
    const safe = Math.min(200, Math.max(1, Math.floor(limite)))
    const res = await dz<DeezerLista<DeezerAlbumBruto>>(
        `/artist/${encodeURIComponent(artistId)}/albums?limit=${safe}`,
        REVALIDAR_ARTISTA
    )
    return (res?.data ?? []).flatMap((a) => {
        if (a.id == null || !a.title) return []
        const md5 = a.md5_image
        return [
            {
                id: String(a.id),
                title: a.title,
                coverUrl:
                    a.cover_big ||
                    a.cover_medium ||
                    (md5 ? coverFromMd5(md5, 500) : null) ||
                    null,
                releaseDate: a.release_date ?? null,
                recordType: a.record_type || 'album',
                nbTracks: Number(a.nb_tracks) || 0,
            },
        ]
    })
}

/* ------------------------------------------------------------------- busca */

export async function searchDeezerTracks(
    query: string,
    limite = 10
): Promise<FaixaDeezer[]> {
    const q = query.trim()
    if (!q) return []
    const safe = Math.min(50, Math.max(1, Math.floor(limite)))
    const res = await dz<DeezerLista<DeezerFaixaBruta>>(
        `/search?q=${encodeURIComponent(q)}&limit=${safe}`,
        REVALIDAR_BUSCA
    )
    return (res?.data ?? []).flatMap((t) => {
        const f = normalizarFaixa(t)
        return f ? [f] : []
    })
}

export async function searchDeezerArtists(
    query: string,
    limite = 10
): Promise<ArtistaDeezer[]> {
    const q = query.trim()
    if (!q) return []
    const safe = Math.min(50, Math.max(1, Math.floor(limite)))
    const res = await dz<DeezerLista<DeezerArtistaBruto>>(
        `/search/artist?q=${encodeURIComponent(q)}&limit=${safe}`,
        REVALIDAR_BUSCA
    )
    return (res?.data ?? []).flatMap((a) => {
        const n = normalizarArtista(a)
        return n ? [n] : []
    })
}
