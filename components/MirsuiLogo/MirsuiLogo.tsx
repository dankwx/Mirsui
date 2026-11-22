import { MARCA_FURO, MARCA_RAZAO, MARCA_VIEWBOX } from './marca'

interface MirsuiLogoProps {
    /** altura do símbolo em px; a largura sai da razão da marca */
    size?: number
    /** cor do símbolo — o padrão é a cor do texto ao redor */
    ink?: string
    className?: string
}

export default function MirsuiLogo({
    size = 30,
    ink = 'currentColor',
    className,
}: MirsuiLogoProps) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width={Math.round(size * MARCA_RAZAO)}
            height={size}
            viewBox={MARCA_VIEWBOX}
            aria-hidden="true"
        >
            <path fillRule="evenodd" d={MARCA_FURO} fill={ink} />
        </svg>
    )
}
