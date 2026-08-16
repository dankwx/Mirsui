// utils/trackHref.ts
//
// O link para a ficha de uma faixa, a partir do que a linha do acervo tem em
// mãos. Um lugar só, porque antes eram quatro implementações levemente
// diferentes espalhadas (perfil, feed, landing, atividade recente) e todas
// dependiam da mesma suposição frágil: que o último segmento de `track_url` é
// um id do Spotify.
//
// A ordem de preferência segue a do identificador canônico:
//
//   1. `isrc` — o código da gravação, que é o endereço do site desde a
//      migration 023. Direto, sem redirecionamento.
//   2. o id do Spotify espremido de `track_url`/`track_uri` — continua
//      funcionando: a rota reconhece o formato e devolve 308 para a forma
//      canônica. É o que mantém de pé link antigo que já circulou por aí.
//   3. '/feed', em vez de montar uma rota quebrada com o título da faixa.
//
// O passo 3 era, literalmente, `/track/${titulo}`: uma linha sem url gerava
// /track/Nome%20Da%20Faixa, que nunca resolveu nada e ainda respondia 200.
//
// O QUE MUDOU
// O endereço ganhou o pedaço legível: `/track/rodrigo-amarante-tuyo-usum72409273`
// em vez de `/track/USUM72409273`. O ISRC continua sendo a chave e continua
// sozinho no fim da URL — o slug é decoração, nunca é consultado, e por isso
// pode ser reescrito quando o Deezer corrigir um título sem que nada no banco
// mude. Ver docs/plano-de-urls-e-seo.md.

import { slugDaFaixa } from '@/utils/slug'

export interface OrigemDoLink {
    isrc?: string | null
    track_url?: string | null
    track_uri?: string | null
    /**
     * O nome da faixa e o do artista, para montar o slug. Duas convenções
     * porque duas existem no código: as linhas que vêm do Supabase usam
     * `track_title`/`artist_name` (feed, acervo, salvamentos) e os tipos
     * próprios usam `title`/`artist` (PileTrack). Aceitar as duas é o que faz
     * os onze pontos de chamada não precisarem mudar.
     *
     * Ausentes, o link sai sem slug e a rota corrige com 308 — é o que torna
     * esta migração incremental em vez de um big bang.
     */
    track_title?: string | null
    artist_name?: string | null
    title?: string | null
    artist?: string | null
}

/**
 * O formato do ISRC. Mora aqui, e não no `utils/trackIdentity.ts` que é
 * `server-only`, porque quem monta link é metade cliente — e uma única
 * definição vale mais que duas iguais. O `trackIdentity` reexporta esta.
 */
export const ISRC_RE = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/

/**
 * A forma canônica do endereço de uma gravação.
 *
 * O ISRC vai em minúscula para não destoar do slug, e é normalizado para
 * maiúscula do lado de dentro (`utils/trackIdentity.ts`). Sem slug — nome em
 * alfabeto não-latino, ou linha que não trouxe os nomes — o endereço é o ISRC
 * puro, que continua sendo uma URL válida e canônica para aquela gravação.
 *
 * Identificador que NÃO é um ISRC (id do Deezer vindo da busca, por exemplo)
 * passa sem slug de propósito: a rota vai trocar a URL inteira por 308 assim
 * que descobrir o ISRC, e decorar um endereço que já vai ser substituído só
 * acrescenta um passo à cadeia.
 */
export function enderecoDaFaixa(
    identificador: string,
    artista?: string | null,
    titulo?: string | null
): string {
    if (!ISRC_RE.test(identificador.toUpperCase())) {
        return `/track/${identificador}`
    }

    const id = identificador.toLowerCase()
    const slug = slugDaFaixa(artista, titulo)
    return slug ? `/track/${slug}-${id}` : `/track/${id}`
}

/**
 * `track_url` guarda a URL completa do Spotify, às vezes com `?si=`
 * (https://open.spotify.com/track/<id>?si=...), e `track_uri` guarda
 * `spotify:track:<id>`. O regex aceita as duas formas e ignora o resto.
 */
const ID_DO_SPOTIFY = /(?:track[:/])([A-Za-z0-9]{22})/

export function trackHref(origem: OrigemDoLink | null | undefined): string {
    if (!origem) return '/feed'

    const artista = origem.artist_name ?? origem.artist ?? null
    const titulo = origem.track_title ?? origem.title ?? null

    if (origem.isrc) return enderecoDaFaixa(origem.isrc, artista, titulo)

    const bruto = origem.track_url || origem.track_uri || ''
    const m = bruto.match(ID_DO_SPOTIFY)
    return m ? `/track/${m[1]}` : '/feed'
}
