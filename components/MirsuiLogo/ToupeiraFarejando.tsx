// A toupeira farejando: a marca com duas ondas de cheiro na frente do nariz.
// É a cara do Faro no perfil.
//
// As ondas chegam até o nariz três vezes quando a página abre e param no
// lugar. O guia pede movimento com função, não animação permanente; com
// movimento reduzido elas já nascem paradas.

import {
    MARCA_CHEIRO,
    MARCA_CHEIRO_TRACO,
    MARCA_RAZAO_FARO,
    MARCA_TOUPEIRA,
    MARCA_VIEWBOX_FARO,
} from './marca'
import styles from './ToupeiraFarejando.module.css'

interface ToupeiraFarejandoProps {
    /** altura em px; a largura sai da proporção do desenho */
    size?: number
    className?: string
}

export default function ToupeiraFarejando({ size = 44, className }: ToupeiraFarejandoProps) {
    return (
        <svg
            viewBox={MARCA_VIEWBOX_FARO}
            width={Math.round(size * MARCA_RAZAO_FARO)}
            height={size}
            className={`${styles.toupeira} ${className ?? ''}`}
            aria-hidden="true"
            focusable="false"
        >
            <path fillRule="evenodd" fill="currentColor" d={MARCA_TOUPEIRA} />
            <g
                fill="none"
                stroke="currentColor"
                strokeWidth={MARCA_CHEIRO_TRACO}
                strokeLinecap="round"
            >
                {MARCA_CHEIRO.map((d) => (
                    <path key={d} d={d} className={styles.onda} />
                ))}
            </g>
        </svg>
    )
}
