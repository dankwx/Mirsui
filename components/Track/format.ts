// components/Track/format.ts
//
// Formatação de apresentação da página de faixa. Tudo em pt-BR e tolerante a
// dado incompleto: linha sem valor vira null e não aparece.

export const MESES = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
]

/** "12 ago 2026". Sem data, um traço — o registro nunca fica com campo vazio. */
export function dataCompleta(ts?: string | null): string {
    if (!ts) return '—'
    const d = new Date(ts)
    if (Number.isNaN(d.getTime())) return '—'
    return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

/** "12 ago", para eixos e legendas curtas. */
export function dataCurta(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`
}

// O Deezer manda a data completa (YYYY-MM-DD), mas o parse continua tolerante:
// o campo pode vir do álbum, com precisão de ano ou de mês.
export function dataDeLancamento(date?: string | null): string | null {
    if (!date) return null
    const [y, m, d] = date.split('-')
    if (d) return `${parseInt(d, 10)} ${MESES[parseInt(m, 10) - 1]} ${y}`
    if (m) return `${MESES[parseInt(m, 10) - 1]} ${y}`
    return y
}

// O gênero do Deezer já vem apresentável e em português ("Rap/Hip Hop",
// "Samba/Pagode"). Sobrou juntar os dois primeiros.
export function generos(genres?: string[] | null): string | null {
    if (!genres || genres.length === 0) return null
    return genres.slice(0, 2).join(' · ')
}

/** Número de pessoas, em pt-BR: 1,2 mi · 340 mil · 8.450 */
export function pessoas(n?: number | null): string | null {
    if (n == null) return null
    if (n >= 1_000_000) {
        const m = (n / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '')
        return `${m} mi`
    }
    if (n >= 1_000) return `${Math.round(n / 1000)} mil`
    return n.toLocaleString('pt-BR')
}

/** O Deezer conta duração em segundos; o Spotify contava em milissegundos. */
export function duracao(segundos: number): string {
    if (!segundos || !Number.isFinite(segundos)) return '0:00'
    const m = Math.floor(segundos / 60)
    const s = Math.floor(segundos % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

/** "+4,3%". pt-BR usa vírgula: "+46.2%" num produto brasileiro é erro, não estilo. */
export function percentual(v: number): string {
    return `${v > 0 ? '+' : ''}${v.toFixed(1).replace('.', ',')}%`
}

export function diasEntre(inicio: string, fim: string): number {
    const a = new Date(inicio).getTime()
    const b = new Date(fim).getTime()
    if (Number.isNaN(a) || Number.isNaN(b)) return 0
    return Math.max(0, Math.round((b - a) / 86_400_000))
}

/** O perfil que veio embutido em cada salvamento — array ou objeto, conforme a fonte. */
export interface PerfilDeQuemSalvou {
    username?: string | null
    display_name?: string | null
    avatar_url?: string | null
}

export function perfilDe(profiles: unknown): PerfilDeQuemSalvou | undefined {
    if (Array.isArray(profiles))
        return profiles[0] as PerfilDeQuemSalvou | undefined
    return (profiles ?? undefined) as PerfilDeQuemSalvou | undefined
}

export function nomeDe(perfil?: PerfilDeQuemSalvou): string {
    return perfil?.display_name || perfil?.username || 'Alguém'
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
