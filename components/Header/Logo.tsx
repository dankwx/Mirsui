'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import GetAuth from '../GetAuth/GetAuth'
import { Input } from '../ui/input'
import { SearchIcon } from 'lucide-react'
import MirsuiLogo from '../MirsuiLogo/MirsuiLogo'

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
            <MirsuiLogo size={38} className="mr-2" />
            <Link
                className={`text-center align-middle transition-opacity duration-300 ${showText ? 'opacity-100' : 'opacity-0'}`}
                href="/"
            >
                mirsui
            </Link>
        </div>
    )
}
