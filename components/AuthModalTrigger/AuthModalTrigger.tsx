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
}: AuthModalTriggerProps) {
    const trigger = React.createElement(
        as,
        {
            className,
            type: as === 'button' ? 'button' : undefined,
            style: as === 'div' ? { cursor: 'pointer', ...style } : style,
        },
        children
    )

    return <LoginModal defaultMode={mode} trigger={trigger} />
}
