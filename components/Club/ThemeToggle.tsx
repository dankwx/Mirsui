'use client'

import { useEffect, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ className }: { className?: string }) {
    const [dark, setDark] = useState(false)
    const preference = useRef<string | null>(null)

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const shell = document.querySelector<HTMLElement>('[data-club-theme]')

        try {
            preference.current = localStorage.getItem('mirsui-landing-theme')
        } catch {
            /* Storage may be disabled. */
        }

        const update = () => {
            const next =
                preference.current === 'dark' ||
                (preference.current !== 'light' && media.matches)
            setDark(next)
            if (shell) shell.dataset.clubTheme = next ? 'dark' : 'light'
        }

        update()
        media.addEventListener('change', update)
        return () => media.removeEventListener('change', update)
    }, [])

    const toggle = () => {
        const next = !dark
        setDark(next)
        preference.current = next ? 'dark' : 'light'
        const shell = document.querySelector<HTMLElement>('[data-club-theme]')
        if (shell) shell.dataset.clubTheme = preference.current

        try {
            localStorage.setItem('mirsui-landing-theme', preference.current)
        } catch {
            /* Keep the in-memory choice. */
        }
    }

    return (
        <button
            type="button"
            className={className}
            onClick={toggle}
            aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
        >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    )
}
