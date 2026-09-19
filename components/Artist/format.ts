// components/Artist/format.ts
//
// Formatação da página de artista. O que é comum à faixa (pessoas, datas,
// iniciais) vem de components/Track/format.ts; aqui fica só o que o Deezer
// entrega em outra unidade para esta tela.

export {
    dataCompleta,
    iniciais,
    nomeDe,
    perfilDe,
    pessoas,
} from '@/components/Track/format'

/** A vitrine fala em milissegundos (herança do Spotify). "3:48". */
export function duracaoMs(ms: number): string {
    if (!ms || !Number.isFinite(ms)) return '—'
    const total = Math.floor(ms / 1000)
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

/** "2013-05-17" → "2013". Tolerante a data só com ano e a string vazia. */
export function ano(date?: string | null): string | null {
    if (!date) return null
    const y = date.slice(0, 4)
    return /^\d{4}$/.test(y) ? y : null
}

/** "1 lançamento" · "36 lançamentos" */
export function plural(n: number, um: string, varios: string): string {
    return `${n.toLocaleString('pt-BR')} ${n === 1 ? um : varios}`
}

/**
 * A foto grande do Deezer vem em 1000×1000; para um círculo de 168 px o
 * variante de 500 basta e carrega bem antes. Só troca quando reconhece o
 * padrão; qualquer outra URL passa intacta.
 */
export function fotoMenor(url: string | null): string | null {
    if (!url) return null
    return url.replace(/\/1000x1000-/, '/500x500-')
}
