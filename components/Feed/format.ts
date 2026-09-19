// components/Feed/format.ts
//
// Formatação de apresentação do feed. Tudo em pt-BR e tolerante a dado
// incompleto: linha sem valor vira null e não aparece.

import { formatTimestamp } from '@/utils/feedHelpers'
import type { FeedPostWithInteractions } from '@/utils/feedService.backend'

export type FeedPost = FeedPostWithInteractions

/** "3º", ou null quando a posição não veio (dado antigo). */
export function ordinal(n: number | null | undefined): string | null {
    if (!n || n < 1) return null
    return `${n}º`
}

/**
 * `formatTimestamp` devolve tempo relativo até 7 dias ("3d") e data absoluta
 * depois ("14/11"). O "há" entrava nos dois casos, então o feed inteiro dizia
 * "salvou há 14/11". Data absoluta pede "em".
 */
export function quando(ts: string | null): string {
    if (!ts) return ''
    const v = formatTimestamp(ts)
    if (v === 'agora mesmo') return v
    return /^\d{2}\/\d{2}$/.test(v) ? `em ${v}` : `há ${v}`
}

export function nomeDe(post: FeedPost, isOwn: boolean): string {
    return isOwn ? 'Você' : post.display_name || post.username || 'Alguém'
}

export function iniciais(nome: string): string {
    return nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase()
}

/** A nota só aparece quando tem conteúdo de verdade — mesma régua da home. */
export function notaDe(post: FeedPost): string | null {
    const texto = post.claim_message?.trim() ?? ''
    return texto.length >= 5 ? texto : null
}
