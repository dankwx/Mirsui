'use client'

// A toupeira dá pulinhos enquanto a próxima página carrega, como no app.
//
// Sem isto, clicar numa faixa deixava a página anterior parada, sem sinal
// nenhum, até o servidor terminar.
//
// POR QUE NÃO É UM loading.tsx: um loading.tsx abre um Suspense em volta da
// página, e o servidor passa a mandar o HTML antes de saber o fim. Aí o 308 da
// faixa (do ISRC puro para o endereço com nome) e o 404 de faixa que não
// existe chegavam como 200, e o rastreador perdia os dois. Aqui nada muda no
// servidor: o componente escuta o clique num link interno e para quando o
// endereço muda.
//
// A toupeira só aparece depois de um quarto de segundo: navegação rápida não
// pisca nada na tela.

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import MirsuiLogo from '@/components/MirsuiLogo/MirsuiLogo'
import styles from './Cavando.module.css'

/** se a navegação não terminar (erro, clique cancelado), a toupeira desiste */
const DESISTE_EM_MS = 12_000

export default function Cavando() {
    const pathname = usePathname()
    const [indo, setIndo] = useState(false)

    useEffect(() => {
        setIndo(false)
    }, [pathname])

    useEffect(() => {
        if (!indo) return
        const desiste = window.setTimeout(() => setIndo(false), DESISTE_EM_MS)
        return () => window.clearTimeout(desiste)
    }, [indo])

    useEffect(() => {
        // Na captura, antes do <Link>: ele chama preventDefault em todo clique
        // para navegar pelo cliente, então o defaultPrevented não diz nada.
        const aoClicar = (e: MouseEvent) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return
            }
            const link = (e.target as Element | null)?.closest?.('a')
            if (!link || !link.href || link.hasAttribute('download')) return
            if (link.target && link.target !== '_self') return

            const destino = new URL(link.href, window.location.href)
            if (destino.origin !== window.location.origin) return
            // Âncora e filtro na mesma página não trocam o endereço; a
            // toupeira ficaria pulando até desistir.
            if (destino.pathname === window.location.pathname) return

            setIndo(true)
        }

        document.addEventListener('click', aoClicar, true)
        return () => document.removeEventListener('click', aoClicar, true)
    }, [])

    if (!indo) return null

    return (
        <div className={styles.cavando} role="status">
            <span className={styles.toupeira}>
                <MirsuiLogo size={52} />
            </span>
            <span className={styles.oculto}>Carregando</span>
        </div>
    )
}
