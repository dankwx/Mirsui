// utils/pileTypes.ts
//
// Tipos e constantes da Pilha compartilhados entre servidor e cliente.
// Ficam fora de pileService.ts porque aquele arquivo é `server-only` e o
// componente da pilha ('use client') precisa desses símbolos.

export type PileHeat = 'topo' | 'meio' | 'subsolo'

export interface PileTrack {
    /** id da faixa no Deezer, que é onde o Observatório mede */
    id: string
    /**
     * ISRC da gravação — como as páginas do site são endereçadas (/track/[isrc]).
     *
     * Era o id do Spotify, vindo da ponte da migration 014. A ponte continua
     * existindo (o botão "ouvir no Spotify" usa), mas saiu do endereço: ela
     * cobria 1.388 das 6.490 faixas medidas, então 4 de cada 5 peças da pilha
     * apareciam sem link. Ver migrations/023_isrc_canonico.sql.
     *
     * Continua podendo ser null enquanto a fila de ISRC do job não passou pela
     * faixa — e aí a peça aparece sem link, como antes.
     */
    isrc: string | null
    title: string
    artist: string
    /** 500x500 — usado nas peças grandes */
    cover: string | null
    /** 250x250 — usado nas peças pequenas, que são a maioria */
    coverSmall: string | null
    genre: string
    /** terço do catálogo medido em que a faixa cai — define o tamanho da capa */
    heat: PileHeat
    /** 0-100: nível de audiência medido no Deezer. É o único número real por
     *  faixa hoje; "salvos" e "dias" saíram junto com o mock. */
    audiencia: number
}

// A lista de gêneros saiu daqui: era fixa em dez nomes escolhidos à mão e agora
// os gêneros vêm do próprio Deezer, em português e em número variável (28 na
// última medição, incluindo Samba/Pagode, Axé/Forró e Sertanejo, que a lista
// antiga não tinha). O componente deriva os chips das faixas que recebe.

export const HEAT_LABEL: Record<PileHeat, string> = {
    topo: 'no topo',
    // Era "na subida". Nível não é tendência: afirmar que uma faixa está subindo
    // exige duas medições, e o Observatório começou a medir em 10/08/2026.
    // Quando houver histórico, este rótulo pode virar movimento de verdade.
    meio: 'no meio',
    subsolo: 'no subsolo',
}
