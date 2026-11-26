'use client'

// Os interruptores dos avisos por e-mail. Salva a cada toque: a mudança
// aparece na hora e volta atrás se o banco recusar.

import { useState } from 'react'
import { salvarPreferenciasDeEmail, type Preferencias } from './actions'
import styles from './PreferenciasDeEmail.module.css'

const OPCOES: { chave: keyof Preferencias; titulo: string; apoio: string }[] = [
    {
        chave: 'seguidor',
        titulo: 'Novo seguidor',
        apoio: 'Na hora em que alguém começa a te seguir.',
    },
    {
        chave: 'saltos',
        titulo: 'Faixas do seu acervo subindo',
        apoio: 'Uma vez por semana, as que mais subiram.',
    },
]

export default function PreferenciasDeEmail({
    token,
    inicial,
}: {
    token: string | null
    inicial: Preferencias
}) {
    const [prefs, setPrefs] = useState(inicial)
    const [salvando, setSalvando] = useState<keyof Preferencias | null>(null)
    const [erro, setErro] = useState(false)

    async function alternar(chave: keyof Preferencias) {
        if (salvando) return
        const antes = prefs
        const valor = !prefs[chave]
        setPrefs({ ...prefs, [chave]: valor })
        setSalvando(chave)
        setErro(false)
        const salvo = await salvarPreferenciasDeEmail({ token, [chave]: valor })
        setSalvando(null)
        if (salvo) {
            setPrefs(salvo)
        } else {
            setPrefs(antes)
            setErro(true)
        }
    }

    return (
        <>
            <ul className={styles.lista}>
                {OPCOES.map(({ chave, titulo, apoio }) => (
                    <li key={chave} className={styles.linha}>
                        <div className={styles.texto}>
                            <span id={`aviso-${chave}`} className={styles.titulo}>
                                {titulo}
                            </span>
                            <span className={styles.apoio}>{apoio}</span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={prefs[chave]}
                            aria-labelledby={`aviso-${chave}`}
                            className={styles.interruptor}
                            disabled={salvando === chave}
                            onClick={() => alternar(chave)}
                        >
                            <span className={styles.bolinha} aria-hidden="true" />
                        </button>
                    </li>
                ))}
            </ul>
            {erro && (
                <p className={styles.erro} role="alert">
                    Não salvou. Tente de novo.
                </p>
            )}
        </>
    )
}
