// utils/pileTypes.ts
//
// Tipos e constantes da Pilha compartilhados entre servidor e cliente.
// Ficam fora de pileService.ts porque aquele arquivo é `server-only` e o
// componente da pilha ('use client') precisa desses símbolos.

export type PileHeat = 'topo' | 'meio' | 'subsolo'

export interface PileTrack {
    id: string
    title: string
    artist: string
    /** 500x500 — usado nas peças grandes */
    cover: string | null
    /** 250x250 — usado nas peças pequenas, que são a maioria */
    coverSmall: string | null
    genre: string
    heat: PileHeat
    /** mock: quantas pessoas salvaram a faixa */
    salvos: number
    /** mock: há quantos dias foi o primeiro salvamento */
    dias: number
}

export const PILE_GENRES = [
    'rap',
    'mpb',
    'eletrônica',
    'indie',
    'r&b',
    'pop',
    'rock',
    'soul',
    'jazz',
    'funk',
] as const

export const HEAT_LABEL: Record<PileHeat, string> = {
    topo: 'no topo',
    meio: 'na subida',
    subsolo: 'no subsolo',
}
