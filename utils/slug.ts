// utils/slug.ts
//
// O pedaço legível do endereço.
//
// Mora sozinho aqui, e sem `server-only`, porque os dois lados precisam chegar
// exatamente na MESMA string: o cliente monta o link (Pilha, feed, busca e
// perfil são todos 'use client') e o servidor monta a forma canônica para
// comparar com o que veio na URL. É essa comparação que decide entre renderizar
// e redirecionar — se as duas implementações divergirem num acento, todo clique
// do site passa a pagar um 308 à toa.
//
// Ver docs/plano-de-urls-e-seo.md §8.

/**
 * 60 caracteres. O maior `artista + título` do acervo tem 236, e URL longa
 * demais é truncada na exibição do resultado de busca — o que anula justamente
 * o motivo de haver texto ali.
 */
const MAXIMO = 60

/**
 * Texto livre → pedaço de URL.
 *
 * Pode devolver string vazia, e isso é esperado, não é falha: 3 títulos e 1 nome
 * de artista do acervo não têm um único caractere ASCII (alfabetos não-latinos).
 * Nesses casos o endereço canônico é o identificador puro. O slug é decoração, e
 * decoração pode faltar.
 */
export function slugify(texto: string | null | undefined): string {
    const semAcento = (texto || '')
        // NFD separa a letra do acento; o range abaixo remove as marcas
        // combinantes que sobraram. "Antônio" vira "Antonio" sem tabela de-para
        // e sem caractere invisível no fonte — daí o range vir escapado, e não
        // como classe literal. Sem a flag /u, que exige target es6+.
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

    const bruto = semAcento.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    if (bruto.length <= MAXIMO) return bruto

    // Corta na fronteira de palavra: `rodrigo-amarante-tuy` é pior que
    // `rodrigo-amarante` tanto para quem lê quanto para quem indexa.
    const cortado = bruto.slice(0, MAXIMO)
    const ultimoHifen = cortado.lastIndexOf('-')
    const fim = ultimoHifen > 0 ? cortado.slice(0, ultimoHifen) : cortado
    return fim.replace(/-+$/, '')
}

/**
 * `artista-titulo`, nessa ordem — o nome do artista é o termo mais buscado dos
 * dois, e o começo da URL é o que sobrevive a qualquer truncamento.
 *
 * Só o artista PRINCIPAL entra, e o corte na primeira vírgula acontece aqui, não
 * em quem chama. O motivo é concreto: `observed_tracks.artist_name` guarda um
 * nome só ("Daft Punk") e `tracks.artist_name` guarda a lista inteira ("Daft
 * Punk, Julian Casablancas"), então o mesmo endereço saía diferente conforme a
 * seção da página que montou o link, e a faixa com participação pagava um 308 a
 * cada clique. Centralizar a regra é o que torna impossível os dois lados
 * divergirem.
 */
export function slugDaFaixa(
    artista?: string | null,
    titulo?: string | null
): string {
    const principal = (artista ?? '').split(',')[0]
    return slugify(`${principal} ${titulo ?? ''}`)
}
