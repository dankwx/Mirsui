// O selo de chegada no site: o carimbo com a toupeira, a posição e a data,
// na cor do acento da paleta e com as falhas de tinta. O desenho é
// SeloDesenho, o mesmo do story; a conta fica em ./selo.

import SeloDesenho from './SeloDesenho'
import { textosDoSelo } from './selo'
import styles from './SeloDeChegada.module.css'

interface SeloDeChegadaProps {
    posicao: number | null
    data: string | null
    size?: number
    /** texto para leitor de tela; sem ele o selo é decorativo */
    rotulo?: string
    className?: string
}

export default function SeloDeChegada({
    posicao,
    data,
    size = 104,
    rotulo,
    className,
}: SeloDeChegadaProps) {
    const textos = textosDoSelo(posicao, data)
    if (!textos) return null

    return (
        <SeloDesenho
            cima={textos.cima}
            baixo={textos.baixo}
            cor="currentColor"
            tinta
            size={size}
            className={`${styles.selo} ${className ?? ''}`}
            {...(rotulo
                ? { role: 'img', 'aria-label': rotulo }
                : { 'aria-hidden': true, focusable: false })}
        />
    )
}
