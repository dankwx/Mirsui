'use client'

import { useEffect, useRef, useState } from 'react'
import { Palette } from 'lucide-react'

const palettes = [
    { id: 'mostarda', name: 'Mostarda' },
    { id: 'cobalto', name: 'Cobalto' },
    { id: 'uva', name: 'Uva' },
    { id: 'tomate', name: 'Tomate' },
    { id: 'petroleo', name: 'Petróleo' },
    { id: 'grafite', name: 'Grafite' },
]
const preferenceKey = 'mirsui-home-palette'

export default function PaletteSwitch({
    className,
}: {
    className: string
}) {
    const button = useRef<HTMLButtonElement>(null)
    const [index, setIndex] = useState(0)
    const palette = palettes[index]

    useEffect(() => {
        let initialIndex = 0
        try {
            const saved = localStorage.getItem(preferenceKey)
            const savedIndex = palettes.findIndex(({ id }) => id === saved)
            if (savedIndex >= 0) initialIndex = savedIndex
        } catch {
            /* Storage may be disabled. */
        }
        const shell = button.current?.closest<HTMLElement>('[data-club-theme]')
        if (shell) shell.dataset.homePalette = palettes[initialIndex].id
        setIndex(initialIndex)
    }, [])

    function switchPalette() {
        const next = (index + 1) % palettes.length
        const id = palettes[next].id
        const shell = button.current?.closest<HTMLElement>('[data-club-theme]')
        if (shell) shell.dataset.homePalette = id
        setIndex(next)
        try {
            localStorage.setItem(preferenceKey, id)
        } catch {
            /* The choice remains available for this visit. */
        }
    }

    return (
        <>
            <button
                ref={button}
                type="button"
                className={className}
                onClick={switchPalette}
                aria-label="Trocar paleta"
                title={`Trocar paleta · ${palette.name}`}
            >
                <Palette aria-hidden="true" size={18} />
                <span aria-hidden="true">{palette.name}</span>
            </button>
            <span className="sr-only" role="status">
                Paleta {palette.name}
            </span>
        </>
    )
}
