/**
 * A forma do que `admin_overview()` devolve.
 *
 * Espelha migrations/019_painel_do_dono.sql no backend, campo a campo. Se um
 * nome mudar lá, muda aqui: não existe geração automática entre os dois.
 *
 * Toda data chega como string ISO com fuso (o `at time zone 'utc'` da função
 * cuida do `claimedat`, que é o único campo do banco sem fuso).
 */

export interface Contas {
    total: number
    confirmadas: number
    /** conta criada que nunca teve um login */
    nunca_entraram: number
    novas_30d: number
    ativas_30d: number
    ultima: string | null
}

export interface Achados {
    /** linhas em `tracks`: um salvamento de uma pessoa */
    total: number
    /** `track_uri` distintas: músicas diferentes */
    faixas: number
    /** quantas pessoas já salvaram alguma coisa */
    pessoas: number
    com_recado: number
    primeiro: string | null
    ultimo: string | null
}

export interface Fichas {
    ativas: number
    coletadas: number
    removidas: number
    pessoas: number
    pontos_na_mesa: number
    /** linhas em `stake_snapshots`: o job diário */
    medicoes: number
    ultima_medicao: string | null
    coletas: number
    pontos_coletados: number
}

export interface Observatorio {
    faixas: number
    ativas: number
    com_spotify: number
    com_isrc: number
    medidas_24h: number
    generos: number
    ultima_medicao: string | null
    historico: number
    historico_24h: number
}

export interface Social {
    seguidas: number
    recados: number
    comentarios: number
    favoritas: number
    youtube_cache: number
}

export interface Mes {
    /** 'YYYY-MM' */
    mes: string
    contas: number
    achados: number
    fichas: number
}

export interface Pessoa {
    id: string
    username: string | null
    nome: string | null
    email: string | null
    entrou: string
    ultimo_acesso: string | null
    confirmada: boolean
    achados: number
    fichas: number
    seguidores: number
}

export interface FichaNaMesa {
    id: string
    titulo: string
    artista: string
    capa: string | null
    username: string | null
    multiplicador: number
    /** popularidade no dia em que a ficha entrou */
    base: number
    /** popularidade na última medição */
    atual: number
    pontos: number
    desde: string
    medida_em: string | null
    medicoes: number
}

export interface FaixaSalva {
    uri: string
    titulo: string | null
    artista: string | null
    capa: string | null
    salvamentos: number
    ultimo: string | null
}

export type TipoRegistro =
    | 'conta'
    | 'achado'
    | 'ficha'
    | 'recado'
    | 'comentario'
    | 'seguiu'

export interface Registro {
    tipo: TipoRegistro
    quando: string
    quem: string | null
    titulo: string | null
    artista: string | null
    detalhe: string | null
}

export interface Painel {
    gerado_em: string
    contas: Contas
    achados: Achados
    fichas: Fichas
    observatorio: Observatorio
    social: Social
    meses: Mes[]
    pessoas: Pessoa[]
    mesa: FichaNaMesa[]
    maisSalvas: FaixaSalva[]
    registros: Registro[]
}
