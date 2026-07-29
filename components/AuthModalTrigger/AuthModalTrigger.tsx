'use client'

import React from 'react'
import LoginModal from '../ModalLogin/ModalLogin'

type AuthMode = 'login' | 'signup'

interface AuthModalTriggerProps {
    children: React.ReactNode
    className?: string
    mode?: AuthMode
    /** Elemento HTML usado como gatilho (ex.: 'button', 'div'). Padrão: 'button'. */
    as?: 'button' | 'div'
    style?: React.CSSProperties
    /** Rótulo acessível. Obrigatório na prática quando `as="div"`. */
    ariaLabel?: string
}

/**
 * Abre o modal de autenticação a partir de qualquer ponto da aplicação
 * (inclusive de Server Components, já que este wrapper é client).
 */
export default function AuthModalTrigger({
    children,
    className,
    mode = 'login',
    as = 'button',
    style,
    ariaLabel,
}: AuthModalTriggerProps) {
    const isDiv = as === 'div'

    // O clique é capturado pelo <span> do LoginModal, que envolve este elemento.
    // Como uma <div> não dispara clique por teclado, traduzimos Enter/Espaço em
    // um .click() — sem isso os cards do carrossel ficam inalcançáveis por tab.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        e.currentTarget.click()
    }

    const trigger = React.createElement(
        as,
        {
            className,
            type: isDiv ? undefined : 'button',
            style: isDiv ? { cursor: 'pointer', ...style } : style,
            role: isDiv ? 'button' : undefined,
            tabIndex: isDiv ? 0 : undefined,
            onKeyDown: isDiv ? handleKeyDown : undefined,
            'aria-label': ariaLabel,
        },
        children
    )

    return <LoginModal defaultMode={mode} trigger={trigger} />
}
