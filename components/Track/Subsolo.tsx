// O medidor de subsolo: a toupeira mais ou menos para fora do buraco, conforme
// a audiência de hoje no Observatório (0-100, a mesma do recibo e da curva).
//
// Os cortes saem da distribuição do catálogo medido em 23/11/2026, quando a
// mediana era 5 e só 3% das faixas passavam de 43:
//
//   abaixo de 10   no subsolo       ~59% do catálogo
//   10 a 29        pondo a cara     ~33%
//   30 a 59        saindo da toca    ~7%
//   60 ou mais     estourou          ~2%
//
// Assim a toupeira lá no fundo é o caso comum, que é o que o Mirsui garimpa, e
// os riscos de susto ficam raros o bastante para querer dizer alguma coisa.

import ToupeiraNoBuraco, {
    type NivelDaToca,
} from '@/components/MirsuiLogo/ToupeiraNoBuraco'
import styles from './Subsolo.module.css'

const LEITURAS: Record<NivelDaToca, { nome: string; frase: string }> = {
    0: { nome: 'No subsolo', frase: 'Quase ninguém achou esta faixa ainda.' },
    1: { nome: 'Pondo a cara', frase: 'Começou a circular, mas ainda é cedo.' },
    2: { nome: 'Saindo da toca', frase: 'Já tem bastante gente ouvindo.' },
    3: { nome: 'Estourou', frase: 'Chegou na superfície.' },
}

export function nivelDaToca(audiencia: number): NivelDaToca {
    if (audiencia >= 60) return 3
    if (audiencia >= 30) return 2
    if (audiencia >= 10) return 1
    return 0
}

export default function Subsolo({ audiencia }: { audiencia: number }) {
    const nivel = nivelDaToca(audiencia)
    const { nome, frase } = LEITURAS[nivel]

    return (
        <figure className={styles.subsolo}>
            <ToupeiraNoBuraco
                nivel={nivel}
                size={66}
                className={styles.toupeira}
            />
            <figcaption>
                <strong>{nome}</strong>
                <span>{frase}</span>
                <span>
                    Audiência{' '}
                    <span className={styles.numero}>{audiencia}/100</span>
                </span>
            </figcaption>
        </figure>
    )
}
