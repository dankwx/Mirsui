import {
    MARCA_DISCOS,
    MARCA_MIOLO,
    MARCA_RAZAO,
    MARCA_VIEWBOX,
} from './marca'

interface MirsuiLogoProps {
    /** altura do símbolo em px; a largura sai da razão da marca */
    size?: number
    /** cor dos discos — o padrão é a tinta do produto */
    ink?: string
    /** cor do miolo */
    acc?: string
    className?: string
}

export default function MirsuiLogo({
    size = 30,
    ink = '#ece3d2',
    acc = '#cdef36',
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
            <path fillRule="evenodd" d={MARCA_DISCOS} fill={ink} />
            <path d={MARCA_MIOLO} fill={acc} />
        </svg>
    )
}
