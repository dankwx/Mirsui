// A toupeira da marca, mais ou menos para fora do buraco.
//
// Do nível 0 ao 3: só os olhos no escuro, a cara de fora, a toupeira da marca
// com as patas na borda e, por último, a mesma toupeira com os riscos de susto.
// Serve para o medidor de subsolo da página de faixa e para a 404.
//
// Não há arte nova: é a geometria da marca. O buraco vira uma elipse parada e
// o corpo desce atrás da borda da frente (o arco de baixo da elipse). Corpo e
// buraco são da mesma cor, então o que passa da borda de trás some no escuro.
// O rosto continua vazado mesmo dentro do buraco, por máscara: os olhos
// aparecem no escuro, como na toca de verdade. As patas não entram na máscara:
// quem afundou está com elas lá dentro, e o contorno pinta essa área de tinta.

import {
    MARCA_BURACO,
    MARCA_CONTORNO,
    MARCA_RAZAO,
    MARCA_RISCOS,
    MARCA_ROSTO,
    MARCA_TOUPEIRA,
    MARCA_VIEWBOX,
} from './marca'

export type NivelDaToca = 0 | 1 | 2 | 3

/** quanto o corpo desce em cada nível, nas unidades do desenho (altura 100) */
const AFUNDA: Record<NivelDaToca, number> = { 0: 38, 1: 22, 2: 0, 3: 0 }

interface ToupeiraNoBuracoProps {
    nivel: NivelDaToca
    /** altura em px, como em MirsuiLogo */
    size?: number
    className?: string
}

export default function ToupeiraNoBuraco({
    nivel,
    size = 64,
    className,
}: ToupeiraNoBuracoProps) {
    const dy = AFUNDA[nivel]
    const svgProps = {
        className,
        xmlns: 'http://www.w3.org/2000/svg',
        width: Math.round(size * MARCA_RAZAO),
        height: size,
        viewBox: MARCA_VIEWBOX,
        'aria-hidden': true,
    } as const

    // Para fora do buraco é a marca como ela é, com o buraco desenhado à mão.
    if (dy === 0) {
        return (
            <svg {...svgProps}>
                <path fillRule="evenodd" d={MARCA_TOUPEIRA} fill="currentColor" />
                {nivel === 3 && <path d={MARCA_RISCOS} fill="currentColor" />}
            </svg>
        )
    }

    // O id só depende do nível: duas toupeiras iguais na mesma página geram
    // definições idênticas, e não importa qual das duas o navegador usa.
    const id = `toupeira-toca-${nivel}`
    const { cx, cy, rx, ry } = MARCA_BURACO
    const desce = `translate(0 ${dy})`

    return (
        <svg {...svgProps}>
            <defs>
                {/* O que fica à vista: tudo acima da borda da frente. */}
                <clipPath id={`${id}-boca`}>
                    <rect x={-1} y={-40} width={131} height={cy + 40} />
                    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
                </clipPath>
                {/* O rosto vaza o corpo e o buraco. As patas ficam lá dentro. */}
                <mask
                    id={`${id}-rosto`}
                    maskUnits="userSpaceOnUse"
                    x={-1}
                    y={-1}
                    width={131}
                    height={102}
                >
                    <rect x={-1} y={-1} width={131} height={102} fill="#fff" />
                    <g clipPath={`url(#${id}-boca)`}>
                        <path transform={desce} d={MARCA_ROSTO} fill="#000" />
                    </g>
                </mask>
            </defs>
            <g mask={`url(#${id}-rosto)`} fill="currentColor">
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
                <g clipPath={`url(#${id}-boca)`}>
                    <path transform={desce} d={MARCA_CONTORNO} />
                </g>
            </g>
        </svg>
    )
}
