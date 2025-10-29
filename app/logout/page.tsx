'use client'

import { SignOut } from './actions'
import { useEffect } from 'react'

export default function Deslog() {
    // Definir título da página
    useEffect(() => {
        document.title = 'Logout - Mirsui'
    }, [])

    return (
        <main>
            <div>
                <button onClick={() => SignOut()}>Log Out</button>
            </div>
        </main>
    )
}
