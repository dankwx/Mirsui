/**
 * O selo de chegada: um carimbo redondo com a toupeira no meio, a posição em
 * cima e a data embaixo ("CHEGOU EM 1º" / "05 JUN 2025"). Vai no registro de
 * descoberta do perfil e da faixa, e no story.
 *
 * Aqui fica a conta: onde cada letra cai no arco e os textos. O desenho é
 * SeloDesenho, o mesmo SVG no site e na imagem do story. As letras são
 * contornos prontos (seloGlifos), não texto.
 *
 * Tudo em unidades de uma caixa de 200 x 200, centro em (100, 100).
 */

import { SELO_ALTURA_MAIUSCULA, SELO_GLIFOS } from './seloGlifos'

export const SELO_CAIXA = 200
export const SELO_CENTRO = 100

/** anel de fora, anel de dentro e os dois pontos que separam os textos */
export const SELO_ANEL = { raio: 95, traco: 5 } as const
export const SELO_ANEL_DENTRO = { raio: 56, traco: 3 } as const
export const SELO_PONTOS = { distancia: 72, raio: 3.6 } as const

/** o meio das letras, entre os dois anéis */
const RAIO_TEXTO = 72
/** corpo da letra, nas unidades da caixa */
const FONTE = 20
/** espaço a mais entre letras, em em */
const ESPACO = 0.12
/** o arco máximo de cada texto (radianos), antes de encostar nos pontos */
const ARCO_MAXIMO = 2.7

/** a toupeira no meio, na caixa do corpo da marca (MARCA_VIEWBOX_CORPO) */
export const SELO_TOUPEIRA = { x: 52, y: 62, largura: 96, altura: 76 } as const

/** a inclinação do carimbo batido na mão, em graus */
export const SELO_GIRO = -9

export interface LetraDoSelo {
    /** contorno da letra (em = 1, linha de base em y = 0) */
    d: string
    /** transform SVG que leva a letra ao lugar dela no arco */
    transform: string
}

const glifo = (c: string) => SELO_GLIFOS[c] ?? SELO_GLIFOS[' ']

/**
 * Distribui o texto pelo arco de cima (lido da esquerda para a direita, por
 * fora) ou pelo de baixo (também da esquerda para a direita, por dentro),
 * centrado no meio-dia ou nas seis horas. O topo de cada letra aponta para o
 * centro no arco de baixo e para fora no de cima, como num carimbo.
 */
export function letrasNoArco(texto: string, lado: 'cima' | 'baixo'): LetraDoSelo[] {
    const letras = Array.from(texto.toUpperCase())
    const larguras = letras.map((c) => glifo(c).avanco * FONTE)
    const espaco = ESPACO * FONTE
    const natural = larguras.reduce((a, b) => a + b, 0) + espaco * (letras.length - 1)
    // Posição de três dígitos passa do arco: o espaço entre as letras encolhe
    // antes de elas invadirem os pontos dos lados.
    const sobra = natural - ARCO_MAXIMO * RAIO_TEXTO
    const entre = sobra > 0 ? Math.max(0, espaco - sobra / Math.max(1, letras.length - 1)) : espaco
    const total = larguras.reduce((a, b) => a + b, 0) + entre * (letras.length - 1)

    const meia = (SELO_ALTURA_MAIUSCULA / 2).toFixed(3)
    let andou = -total / 2
    return letras.map((c, i) => {
        const meio = andou + larguras[i] / 2
        andou += larguras[i] + entre
        const angulo = meio / RAIO_TEXTO
        const x = SELO_CENTRO + Math.sin(angulo) * RAIO_TEXTO
        const y =
            lado === 'cima'
                ? SELO_CENTRO - Math.cos(angulo) * RAIO_TEXTO
                : SELO_CENTRO + Math.cos(angulo) * RAIO_TEXTO
        const graus = ((lado === 'cima' ? angulo : -angulo) * 180) / Math.PI
        const g = glifo(c)
        return {
            d: g.d,
            transform:
                `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${graus.toFixed(2)}) ` +
                `scale(${FONTE}) translate(${(-g.avanco / 2).toFixed(3)} ${meia})`,
        }
    })
}

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

/** "05 JUN 2025"; null sem data válida (aí não tem selo) */
export function dataDoSelo(ts?: string | null): string | null {
    if (!ts) return null
    const d = new Date(ts)
    if (Number.isNaN(d.getTime())) return null
    return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

/** os dois textos do selo; null quando falta posição ou data */
export function textosDoSelo(
    posicao: number | null | undefined,
    data: string | null | undefined
): { cima: string; baixo: string } | null {
    const baixo = dataDoSelo(data)
    if (!posicao || posicao < 1 || !baixo) return null
    return { cima: `CHEGOU EM ${posicao}º`, baixo }
}
