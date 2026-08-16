import 'server-only'
import { unstable_cache } from 'next/cache'
import { supabasePublic } from '@/utils/supabase/public'

/**
 * Dados da home deslogada.
 *
 * A home antiga vendia o produto por seções de argumento. Esta mostra o acervo,
 * e para isso precisa de volume: o Observatório tem 2.994 faixas ativas, todas
 * com capa, e é a única fonte densa que existe hoje. Os salvamentos das pessoas
 * são poucos (dezenas), então aparecem como o que são, sem inflar.
 *
 * Tudo aqui é cacheado: a home é a página mais visitada e nada disso muda de
 * minuto a minuto.
 */

const UMA_HORA = 3600

/**
 * Capa do Deezer, na mesma montagem da Pilha e do Observatório.
 *
 * O tamanho é parâmetro porque a parede do topo põe dezenas de capas acima da
 * dobra: pedir 500x500 para um mosaico de 90px seria arrastar megabytes para
 * pintar miniatura.
 */
export const capaDoAcervo = (md5: string | null, lado: 120 | 250 | 500 = 500) =>
    md5 ? `https://cdn-images.dzcdn.net/images/cover/${md5}/${lado}x${lado}-000000-80-0-0.jpg` : null

export interface FaixaDoAcervo {
    id: string
    titulo: string
    artista: string
    genero: string | null
    /** hash da capa no Deezer; vira URL por `capaDoAcervo` no tamanho que a tela pedir */
    md5: string | null
    /** rank do Deezer: ~2 mil é subsolo, ~1 milhão é hit */
    rank: number | null
    /**
     * ISRC — o endereço da faixa no site (/track/<ISRC>).
     *
     * Era `spotifyId`, e a nota aqui dizia "só ~1/4 do catálogo tem par no
     * Spotify, e só esses viram link". Esse um quarto era o funil inteiro do
     * site: 5.102 gravações medidas todo dia apareciam na parede sem link
     * porque uma API de terceiro não confirmou que elas existem no mercado BR
     * dela. Com o ISRC como endereço, quem tem ISRC tem página.
     */
    isrc: string | null
}

export interface GeneroDoAcervo {
    nome: string
    total: number
    faixas: FaixaDoAcervo[]
}

interface LinhaBruta {
    deezer_track_id: string
    title: string | null
    artist_name: string | null
    genre: string | null
    cover_md5: string | null
    last_rank: number | null
    isrc: string | null
}

const paraFaixa = (l: LinhaBruta): FaixaDoAcervo => ({
    id: l.deezer_track_id,
    titulo: l.title ?? '',
    artista: l.artist_name ?? '',
    genero: l.genre,
    md5: l.cover_md5,
    rank: l.last_rank,
    isrc: l.isrc,
})

/**
 * Embaralha sempre igual para a mesma semente.
 *
 * Não usa Math.random porque a página é cacheada e renderizada no servidor: uma
 * ordem diferente a cada render faria o HTML do cache brigar com o da
 * hidratação. Fisher-Yates com um gerador congruencial simples resolve.
 */
function embaralharEstavel<T>(lista: T[], semente: number): T[] {
    const saida = lista.slice()
    let s = semente
    const proximo = () => {
        s = (s * 1664525 + 1013904223) % 4294967296
        return s / 4294967296
    }
    for (let i = saida.length - 1; i > 0; i--) {
        const j = Math.floor(proximo() * (i + 1))
        ;[saida[i], saida[j]] = [saida[j], saida[i]]
    }
    return saida
}

/**
 * A parede de capas do topo.
 *
 * Puxa mais linhas do que mostra e embaralha, senão a parede sai agrupada por
 * gênero — o catálogo foi semeado gênero a gênero, então a ordem natural da
 * tabela são cem capas de música indiana seguidas.
 */
const paredeCacheada = unstable_cache(
    async (quantas: number): Promise<FaixaDoAcervo[]> => {
        const { data, error } = await supabasePublic
            .from('observed_tracks')
            .select('deezer_track_id,title,artist_name,genre,cover_md5,last_rank,isrc')
            .eq('active', true)
            .not('cover_md5', 'is', null)
            .limit(quantas * 6)

        if (error) {
            console.error('[home] falha na parede do acervo:', error.message)
            return []
        }
        return embaralharEstavel((data ?? []) as LinhaBruta[], 20260811)
            .slice(0, quantas)
            .map(paraFaixa)
    },
    ['home-parede'],
    { revalidate: UMA_HORA, tags: ['home', 'observatorio'] }
)

export function getParedeDoAcervo(quantas = 60): Promise<FaixaDoAcervo[]> {
    return paredeCacheada(quantas)
}

/**
 * Gêneros com contagem real e algumas capas de amostra.
 *
 * A contagem vem de uma varredura da coluna `genre` inteira (uma coluna de
 * texto em 2.994 linhas, cacheada por uma hora) porque o número precisa ser o
 * do catálogo todo, não o da amostra que vai para a tela.
 */
/**
 * Os gêneros que vão para a home, na ordem em que vão.
 *
 * É escolha editorial, e precisa ser. O Observatório semeia o catálogo de
 * forma quase uniforme (entre 93 e 170 faixas por gênero), então ordenar por
 * volume não ordena por nada: o topo saía "Música Indiana, Cumbia, Clássica,
 * Infantil, Filmes/Games" — o catálogo do Deezer inteiro, incluindo música
 * infantil e trilha de jogo, que não é o assunto de ninguém que entra aqui.
 *
 * As contagens continuam sendo as reais do acervo. O que é curado é a lista,
 * não o número.
 */
const GENEROS_DA_CASA = [
    'MPB',
    'Rap/Funk Brasileiro',
    'Samba/Pagode',
    'Alternativo',
    'Rap/Hip Hop',
    'Electro',
    'Rock',
    'Soul & Funk',
]

const generosCacheados = unstable_cache(
    async (quantosGeneros: number, capasPorGenero: number): Promise<GeneroDoAcervo[]> => {
        /**
         * O PostgREST devolve no máximo mil linhas por requisição, e o acervo
         * tem quase três mil. Sem paginar, a contagem sai calada e errada: o
         * MPB aparecia com 99 faixas quando tem 116, e o Rap/Hip Hop com 78
         * quando tem 109. Número errado numa página pública é a mesma doença
         * dos "Nº 042" que saíram da /track.
         */
        const PAGINA = 1000
        const generosBrutos: string[] = []
        for (let de = 0; ; de += PAGINA) {
            const { data, error } = await supabasePublic
                .from('observed_tracks')
                .select('genre')
                .eq('active', true)
                .not('genre', 'is', null)
                .range(de, de + PAGINA - 1)

            if (error) {
                console.error('[home] falha na contagem de gêneros:', error.message)
                return []
            }
            const pagina = (data ?? []) as { genre: string }[]
            generosBrutos.push(...pagina.map((l) => l.genre))
            if (pagina.length < PAGINA) break
        }

        const totais = new Map<string, number>()
        for (const g of generosBrutos) {
            totais.set(g, (totais.get(g) ?? 0) + 1)
        }

        // Uma consulta por gênero da casa. Uma amostra única de mil linhas não
        // garantia capas para todos eles — dependia de quais linhas o Postgres
        // devolvesse primeiro, e alguns gêneros sumiam da home sem motivo.
        const escolhidos = GENEROS_DA_CASA.slice(0, quantosGeneros)
        const fileiras = await Promise.all(
            escolhidos.map(async (nome) => {
                const { data, error } = await supabasePublic
                    .from('observed_tracks')
                    .select(
                        'deezer_track_id,title,artist_name,genre,cover_md5,last_rank,isrc'
                    )
                    .eq('active', true)
                    .eq('genre', nome)
                    .not('cover_md5', 'is', null)
                    .limit(capasPorGenero * 4)

                if (error) {
                    console.error(`[home] falha nas capas de ${nome}:`, error.message)
                    return null
                }
                const faixas = embaralharEstavel((data ?? []) as LinhaBruta[], 981)
                    .slice(0, capasPorGenero)
                    .map(paraFaixa)

                if (faixas.length < capasPorGenero) return null
                return { nome, total: totais.get(nome) ?? faixas.length, faixas }
            })
        )

        // Mantém a ordem editorial: filter preserva a ordem de GENEROS_DA_CASA.
        return fileiras.filter((f): f is GeneroDoAcervo => f !== null)
    },
    ['home-generos'],
    { revalidate: UMA_HORA, tags: ['home', 'observatorio'] }
)

export function getGenerosDoAcervo(
    quantosGeneros = 8,
    capasPorGenero = 5
): Promise<GeneroDoAcervo[]> {
    return generosCacheados(quantosGeneros, capasPorGenero)
}

export interface PessoaDaCena {
    username: string
    nome: string
    avatar: string | null
    faixas: number
    primeiros: number
}

/**
 * Quem já está aqui.
 *
 * A cena tem cinco pessoas. A home mostra as cinco, com o número real de cada
 * uma. Inventar gente seria a coisa mais fácil e a mais burra: qualquer
 * visitante que clicasse num perfil inventado descobriria em um segundo, e aí
 * o resto da página também vira suspeito.
 */
const pessoasCacheadas = unstable_cache(
    async (limite: number): Promise<PessoaDaCena[]> => {
        const { data, error } = await supabasePublic
            .from('tracks')
            .select('user_id,position,profiles:user_id!inner(username,display_name,avatar_url)')
            .not('claimedat', 'is', null)

        if (error) {
            console.error('[home] falha nas pessoas da cena:', error.message)
            return []
        }

        const mapa = new Map<string, PessoaDaCena>()
        for (const l of (data ?? []) as any[]) {
            const p = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles
            if (!p?.username) continue
            const atual = mapa.get(p.username) ?? {
                username: p.username,
                nome: p.display_name || p.username,
                avatar: p.avatar_url ?? null,
                faixas: 0,
                primeiros: 0,
            }
            atual.faixas++
            if (l.position === 1) atual.primeiros++
            mapa.set(p.username, atual)
        }

        return Array.from(mapa.values())
            .sort((a, b) => b.faixas - a.faixas || b.primeiros - a.primeiros)
            .slice(0, limite)
    },
    ['home-pessoas'],
    { revalidate: UMA_HORA, tags: ['home'] }
)

export function getPessoasDaCena(limite = 6): Promise<PessoaDaCena[]> {
    return pessoasCacheadas(limite)
}
