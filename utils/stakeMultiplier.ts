// utils/stakeMultiplier.ts
// Formatação do multiplicador para a UI dos Stakes. O cálculo do valor é feito
// no backend (ver mirsui-backend/src/lib/stakePoints.ts e Stake.md), a partir
// dos dados do Deezer; a tela só formata o número que vem de lá.

// Formata como "x2,4" (pt-BR, uma casa decimal)
export function formatMultiplier(mult: number): string {
    return 'x' + mult.toFixed(1).replace('.', ',')
}
