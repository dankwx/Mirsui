'use client'

import { SignOut } from './actions'

export default function Deslog() {
    return (
        <main>
            <div>
                <button onClick={() => SignOut()}>Log Out</button>
            </div>
        </main>
    )
}
