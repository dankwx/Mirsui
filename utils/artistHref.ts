// utils/artistHref.ts
//
// O link para a página de um artista, na mesma regra da ficha da faixa: o
// identificador é a chave, o slug é decoração.
//
//   /artist/rodrigo-amarante-4050205
//
// A chave aqui é o id numérico do Deezer, que é onde o Observatório mede e o
// que a rota já aceitava sozinho — `/artist/4050205` continua abrindo e ganha
// 308 para a forma completa.
//
// Ver docs/plano-de-urls-e-seo.md §6.

import { slugify } from '@/utils/slug'

/**
 * A forma canônica do endereço de um artista.
 *
 * Sem nome (ou com nome em alfabeto não-latino, que slugifica para vazio) o
 * endereço é o id puro — que continua válido e canônico.
 */
export function enderecoDoArtista(
    deezerId: string | number,
    nome?: string | null
): string {
    const id = String(deezerId)
    const slug = slugify(nome)
    return slug ? `/artist/${slug}-${id}` : `/artist/${id}`
}

/**
 * O id do Deezer escondido no fim de um endereço da forma `slug-id`.
 *
 * Devolve null quando o que vem depois do último hífen não é um número — e é
 * por isso que nome de artista terminado em dígito não confunde nada:
 * `/artist/blink-182-412` parte no ÚLTIMO hífen, então o id é 412 e o slug é
 * `blink-182`.
 */
export function idDoArtistaNoEndereco(bruto: string): string | null {
    const s = (bruto || '').trim()
    if (/^\d+$/.test(s)) return s

    const corte = s.lastIndexOf('-')
    if (corte <= 0) return null

    const cauda = s.slice(corte + 1)
    return /^\d+$/.test(cauda) ? cauda : null
}
