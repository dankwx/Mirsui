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

export interface OrigemDoLink {
    isrc?: string | null
    track_url?: string | null
    track_uri?: string | null
}

/**
 * `track_url` guarda a URL completa do Spotify, às vezes com `?si=`
 * (https://open.spotify.com/track/<id>?si=...), e `track_uri` guarda
 * `spotify:track:<id>`. O regex aceita as duas formas e ignora o resto.
 */
const ID_DO_SPOTIFY = /(?:track[:/])([A-Za-z0-9]{22})/

export function trackHref(origem: OrigemDoLink | null | undefined): string {
    if (!origem) return '/feed'

    if (origem.isrc) return `/track/${origem.isrc.toUpperCase()}`

    const bruto = origem.track_url || origem.track_uri || ''
    const m = bruto.match(ID_DO_SPOTIFY)
    return m ? `/track/${m[1]}` : '/feed'
}
