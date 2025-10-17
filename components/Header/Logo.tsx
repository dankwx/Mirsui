'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import GetAuth from '../GetAuth/GetAuth'
import { Input } from '../ui/input'
import { SearchIcon } from 'lucide-react'

export default function Logo() {
    const [showText, setShowText] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    const controlNavbar = useCallback(() => {
        if (typeof window !== 'undefined') {
            if (window.scrollY > lastScrollY) {
                // if scroll down hide the navbar
                setShowText(false)
            } else {
                // if scroll up show the navbar
                setShowText(true)
            }

            // remember current page location to use in the next move
            setLastScrollY(window.scrollY)
        }
    }, [lastScrollY])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar)

            // cleanup function
            return () => {
                window.removeEventListener('scroll', controlNavbar)
            }
        }
    }, [controlNavbar])

    return (
        <div className="flex items-center justify-center align-middle">
            <svg
                className="mr-2"
                xmlns="http://www.w3.org/2000/svg"
                width="44"
                height="38"
                viewBox="0 0 24 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" />
            </svg>
            <Link
                className={`text-center align-middle transition-opacity duration-300 ${showText ? 'opacity-100' : 'opacity-0'}`}
                href="/"
            >
                sound sage
            </Link>
        </div>
    )
}
