// app/layout.tsx (Layout raiz - SEM 'use client')
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'SoundSage',
    description:
        'Claim your music and prove that you litened to it before it got popular',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <Toaster />
            </body>
        </html>
    )
}
