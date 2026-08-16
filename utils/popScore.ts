// utils/popScore.ts
//
// Porta de mirsui-backend/src/lib/stakePoints.ts, que é a fonte da verdade.
// Fica duplicado aqui porque o front não importa do backend, e a alternativa
// (mais uma chamada de rede para dividir um número por 10.000) seria pior.
//
// Por que isto passou a importar na página de faixa: até agora a "popularidade
// hoje" do recibo era o `popularity` do Spotify (0-100) e a curva logo abaixo
// era o `rank` do Deezer. Duas escalas, de duas empresas, no mesmo bloco visual.
// Com o Deezer como fonte única, o número do recibo passa a ser o mesmo que
// alimenta a curva e os Stakes.

/**
 * Normaliza o `rank` do Deezer (~100k obscuro a ~985k hit) para 0-100.
 * Ex.: 107.970 -> 11, 417.559 -> 42, 984.833 -> 98.
 */
export function popScore(rank: number): number {
    const n = Math.round((Number(rank) || 0) / 10000)
    if (!Number.isFinite(n)) return 0
    return Math.min(100, Math.max(0, n))
}
