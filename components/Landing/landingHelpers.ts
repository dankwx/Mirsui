/**
 * Formatadores da home. Ficam soltos aqui porque as seções são Server
 * Components e não precisam de nada além de string in, string out.
 */

const MESES = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

/** "14 nov" — curto o bastante para caber na coluna do registro. */
export function diaMes(iso: string | null): string {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return `${d.getDate()} ${MESES[d.getMonth()]}`
}

// A rota da ficha mora em utils/trackHref.ts desde que o ISRC virou o
// identificador canônico (migration 023): agora a home prefere o ISRC da linha
// e só cai no id do Spotify espremido da URL quando ele não existe.
export { trackHref } from '@/utils/trackHref'

/** Iniciais para a capa que não carregou. */
export function iniciais(nome: string): string {
    return (nome || '')
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

/**
 * Fundo determinístico da capa ausente. Tons quentes e dessaturados, todos da
 * família do mir-bg: a capa que falta não pode virar o elemento mais colorido
 * da fileira.
 */
const TONS = [
    '#241f1a', '#27201f', '#2a201b', '#25211c', '#26211f',
    '#1f231d', '#202420', '#231d27', '#1b2026', '#1d2126',
]
export function tom(semente: string): string {
    let h = 0
    for (let i = 0; i < semente.length; i++) {
        h = (h * 31 + semente.charCodeAt(i)) >>> 0
    }
    return TONS[h % TONS.length]
}
