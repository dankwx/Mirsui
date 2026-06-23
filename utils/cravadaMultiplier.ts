// utils/cravadaMultiplier.ts
// Formatação do multiplicador para a UI das Cravadas. O cálculo do valor é feito
// no backend (ver mirsui-backend/src/lib/cravadaPoints.ts e Cravada.md), a partir
// dos dados do Deezer; a tela só formata o número que vem de lá.

// Formata como "x2,4" (pt-BR, uma casa decimal)
export function formatMultiplier(mult: number): string {
    return 'x' + mult.toFixed(1).replace('.', ',')
}
