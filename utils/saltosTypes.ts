// utils/saltosTypes.ts
//
// O que GET /admin/saltos devolve: a fila de saltos de audiência do painel do
// dono. A forma é a de `saltos_do_painel` (mirsui-backend, migration 052).

export type StatusDoSalto = 'pendente' | 'publicado' | 'ignorado' | 'expirado'

export const STATUS_DOS_SALTOS: StatusDoSalto[] = [
    'pendente',
    'publicado',
    'ignorado',
    'expirado',
]

export interface FaixaDoSalto {
    deezer_track_id: string
    deezer_artist_id: string | null
    isrc: string | null
    title: string
    artist_name: string
    album_name: string | null
    cover_md5: string | null
    genre: string | null
    release_date: string | null
    last_rank: number | null
}

export interface NotaDoPainel {
    id: number
    texto: string
    fonte_url: string | null
    fonte_nome: string | null
}

export interface SaltoDoPainel {
    id: number
    /** dia (UTC) do pico do salto, YYYY-MM-DD */
    dia: string
    rank_antes: number
    rank_depois: number
    /** popScore(rank_depois) - popScore(rank_antes) */
    pontos: number
    status: StatusDoSalto
    decidido_em: string | null
    faixa: FaixaDoSalto
    nota: NotaDoPainel | null
    /** notas já publicadas para a mesma gravação, em outros saltos */
    anteriores: { dia: string; pontos: number; texto: string }[]
    /** pontos de mudança do rank, de 30 dias antes do salto até hoje */
    serie: { d: string; r: number }[]
}

export interface FilaDeSaltos {
    status: StatusDoSalto
    contagem: Record<StatusDoSalto, number>
    saltos: SaltoDoPainel[]
}
