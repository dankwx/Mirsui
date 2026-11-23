// O desenho do selo de chegada, igual no site (SeloDeChegada) e na imagem do
// story (app/api/og/selo). Só SVG simples, sem CSS nem fonte, porque o
// next/og desenha isto também.
//
// `tinta` liga as falhas de carimbo de borracha (máscara com ruído largo). O
// next/og não tem filtro, então o story sai com a tinta lisa. Os ids são
// fixos: a máscara é igual em todo selo, e repetir a definição não muda nada.

import type { SVGProps } from 'react'
import { MARCA_TOUPEIRA } from './marca'
import {
    SELO_ANEL,
    SELO_ANEL_DENTRO,
    SELO_CAIXA,
    SELO_CENTRO,
    SELO_GIRO,
    SELO_PONTOS,
    SELO_TOUPEIRA,
    letrasNoArco,
} from './selo'

// A toupeira vem na caixa do corpo da marca (-1 22.6 131 78.4) e cabe na
// largura do miolo, centrada na altura.
const ESCALA_TOUPEIRA = SELO_TOUPEIRA.largura / 131
const TOUPEIRA_Y = SELO_TOUPEIRA.y + (SELO_TOUPEIRA.altura - 78.4 * ESCALA_TOUPEIRA) / 2
const TOUPEIRA_TRANSFORM =
    `translate(${SELO_TOUPEIRA.x} ${TOUPEIRA_Y.toFixed(2)}) ` +
    `scale(${ESCALA_TOUPEIRA.toFixed(4)}) translate(1 -22.6)`

type SeloDesenhoProps = {
    cima: string
    baixo: string
    /** cor da tinta; no site, currentColor */
    cor: string
    tinta?: boolean
    size: number
} & Omit<SVGProps<SVGSVGElement>, 'children'>

export default function SeloDesenho({
    cima,
    baixo,
    cor,
    tinta = false,
    size,
    ...svg
}: SeloDesenhoProps) {
    const c = SELO_CENTRO
    const letras = [...letrasNoArco(cima, 'cima'), ...letrasNoArco(baixo, 'baixo')]

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${SELO_CAIXA} ${SELO_CAIXA}`}
            width={size}
            height={size}
            {...svg}
        >
            {tinta && (
                <defs>
                    <filter id="selo-tinta" x="0" y="0" width="1" height="1">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.045"
                            numOctaves={3}
                            seed={11}
                        />
                        <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.5 1.65"
                        />
                    </filter>
                    <mask
                        id="selo-falha"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width={SELO_CAIXA}
                        height={SELO_CAIXA}
                    >
                        <rect
                            width={SELO_CAIXA}
                            height={SELO_CAIXA}
                            fill="#fff"
                            filter="url(#selo-tinta)"
                        />
                    </mask>
                </defs>
            )}

            <g
                transform={`rotate(${SELO_GIRO} ${c} ${c})`}
                fill={cor}
                mask={tinta ? 'url(#selo-falha)' : undefined}
            >
                <circle
                    cx={c}
                    cy={c}
                    r={SELO_ANEL.raio}
                    fill="none"
                    stroke={cor}
                    strokeWidth={SELO_ANEL.traco}
                />
                <circle
                    cx={c}
                    cy={c}
                    r={SELO_ANEL_DENTRO.raio}
                    fill="none"
                    stroke={cor}
                    strokeWidth={SELO_ANEL_DENTRO.traco}
                />
                <circle cx={c - SELO_PONTOS.distancia} cy={c} r={SELO_PONTOS.raio} />
                <circle cx={c + SELO_PONTOS.distancia} cy={c} r={SELO_PONTOS.raio} />
                {letras.map(({ d, transform }, i) => (
                    <path key={i} d={d} transform={transform} />
                ))}
                <path fillRule="evenodd" d={MARCA_TOUPEIRA} transform={TOUPEIRA_TRANSFORM} />
            </g>
        </svg>
    )
}
