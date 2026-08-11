import 'server-only'
import { createClient } from '@/utils/supabase/server'
import type { Song } from '@/types/profile'

/**
 * Números do perfil.
 *
 * Regra da casa: nada aqui é derivado de hash do username. O perfil antigo
 * exibia "FARO TOP 14%", "PERFIL Nº 002" e "+7 meses" por faixa, e os quatro
 * saíam de `hashStr(username)`. Quem passa dois minutos na própria página
 * percebe que o número nunca muda, e aí a página inteira perde a fé.
 *
 * O que sobrou é o que o banco já sabe: `position` (ordem de chegada naquela
 * música), `claimedat` e `artist_name`.
 */

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export interface TopArtist {
    name: string
    count: number
    thumbnail: string | null
    /** melhor colocação que o usuário tirou em alguma faixa desse artista */
    bestPosition: number | null
}

export interface ProfileStats {
    total: number
    /** faixas em que ninguém tinha salvado antes */
    first: number
    /** faixas em que chegou entre os dez primeiros */
    topTen: number
    artists: number
    /** mês do salvamento mais antigo, ex.: "dez 2024" */
    since: string | null
}

const mesAno = (iso: string | null) => {
    if (!iso) return null
    const d = new Date(iso)
    if (isNaN(d.getTime())) return null
    return `${MESES[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * "Daft Punk, Julian Casablancas" conta para os dois. O perfil antigo usava só
 * o primeiro nome antes da vírgula, então participação especial não existia.
 */
export const creditedArtists = (song: Song) =>
    song.artist_name
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)

export function buildProfileStats(songs: Song[]): ProfileStats {
    const artists = new Set<string>()
    let first = 0
    let topTen = 0
    let oldest: string | null = null

    for (const song of songs) {
        for (const artist of creditedArtists(song)) artists.add(artist.toLowerCase())

        const pos = song.position
        if (pos === 1) first++
        if (pos !== null && pos <= 10) topTen++

        if (song.claimedat && (!oldest || song.claimedat < oldest)) oldest = song.claimedat
    }

    return {
        total: songs.length,
        first,
        topTen,
        artists: artists.size,
        since: mesAno(oldest),
    }
}

/**
 * O número de orgulho do cabeçalho, em escada.
 *
 * Quem nunca chegou em primeiro não merece um "0 vezes em primeiro" na cara:
 * cai para o top 10, e depois para a melhor colocação que tiver. Só some de
 * vez quando o acervo está vazio.
 */
export function buildBadge(
    stats: ProfileStats,
    songs: Song[]
): { value: string; label: string } | null {
    if (stats.first > 0) {
        return {
            value: String(stats.first),
            label: stats.first === 1 ? 'vez em primeiro' : 'vezes em primeiro',
        }
    }
    if (stats.topTen > 0) {
        return { value: String(stats.topTen), label: 'no top 10' }
    }

    const best = songs.reduce<number | null>(
        (acc, song) =>
            song.position !== null && (acc === null || song.position < acc)
                ? song.position
                : acc,
        null
    )
    if (best !== null) return { value: `${best}ª`, label: 'melhor colocação' }

    return null
}

/**
 * Artistas mais salvos, com a capa de uma faixa dele para servir de retrato.
 *
 * `minCount` existe porque artista de uma faixa só não é artista favorito de
 * ninguém: sem o corte, um acervo pequeno enche a fileira de nomes que
 * apareceram uma vez, todos com a mesma capa emprestada da mesma faixa.
 */
export function buildTopArtists(songs: Song[], limit = 6, minCount = 2): TopArtist[] {
    const map = new Map<string, TopArtist>()

    for (const song of songs) {
        for (const name of creditedArtists(song)) {
            const key = name.toLowerCase()
            const current = map.get(key)

            if (!current) {
                map.set(key, {
                    name,
                    count: 1,
                    thumbnail: song.track_thumbnail,
                    bestPosition: song.position,
                })
                continue
            }

            current.count++
            if (!current.thumbnail) current.thumbnail = song.track_thumbnail
            if (
                song.position !== null &&
                (current.bestPosition === null || song.position < current.bestPosition)
            ) {
                current.bestPosition = song.position
            }
        }
    }

    return Array.from(map.values())
        .filter((artist) => artist.count >= minCount)
        .sort((a, b) => b.count - a.count || (a.bestPosition ?? 1e9) - (b.bestPosition ?? 1e9))
        .slice(0, limit)
}

/**
 * As faixas em que o usuário chegou mais cedo. Empate em posição desempata
 * pela mais recente, para a vitrine não congelar em faixas de 2024.
 */
export function buildEarliest(songs: Song[], limit = 5): Song[] {
    return songs
        .filter((song) => song.position !== null)
        .sort(
            (a, b) =>
                (a.position ?? 1e9) - (b.position ?? 1e9) ||
                (b.claimedat ?? '').localeCompare(a.claimedat ?? '')
        )
        .slice(0, limit)
}

/**
 * Ordena a vitrine entre os candidatos de `buildEarliest`.
 *
 * Só a posição não basta: quem tem quinze faixas em 1º empata quinze vezes, e
 * a escolha vira sorteio. Chegar primeiro numa música que 400 pessoas salvaram
 * depois vale mais do que chegar primeiro numa que ninguém mais achou, então o
 * desempate é por quanta gente veio atrás.
 */
export function rankVitrine(
    candidates: Song[],
    savers: Record<string, number>,
    limit: number
): Song[] {
    const depoisDe = (song: Song) =>
        song.track_uri ? (savers[song.track_uri] ?? 0) : 0

    return candidates
        .slice()
        .sort(
            (a, b) =>
                (a.position ?? 1e9) - (b.position ?? 1e9) ||
                depoisDe(b) - depoisDe(a) ||
                (b.claimedat ?? '').localeCompare(a.claimedat ?? '')
        )
        .slice(0, limit)
}

/**
 * Quantas pessoas salvaram cada música, no total. Um head count exato por URI.
 *
 * Só é chamado para os candidatos da vitrine (uma dúzia), então é uma dúzia de
 * COUNTs paralelos e nenhuma linha trafega. Rodar isso no acervo inteiro
 * precisaria de uma RPC com GROUP BY; não vale a migração enquanto o número
 * aparecer em cinco lugares.
 */
export async function countSaversByUri(uris: string[]): Promise<Record<string, number>> {
    const unique = Array.from(new Set(uris.filter(Boolean)))
    if (unique.length === 0) return {}

    const supabase = await createClient()

    const counts = await Promise.all(
        unique.map(async (uri) => {
            const { count, error } = await supabase
                .from('tracks')
                .select('id', { count: 'exact', head: true })
                .eq('track_uri', uri)

            if (error) {
                console.error('Erro ao contar quem salvou:', uri, error)
                return [uri, 0] as const
            }
            return [uri, count ?? 0] as const
        })
    )

    return Object.fromEntries(counts)
}
