// app/layout.tsx (Layout raiz - SEM 'use client')
import type { Metadata } from 'next'
import { Archivo, Hanken_Grotesk, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Footer from '@/components/Footer/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics/GoogleAnalytics'
import AnalyticsProvider from '@/components/AnalyticsProvider/AnalyticsProvider'
import PostHogProvider from '@/components/PostHogProvider/PostHogProvider'

const hanken = Hanken_Grotesk({
    subsets: ['latin'],
    variable: '--font-hanken',
})
const archivo = Archivo({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
    variable: '--font-archivo',
})
// Grotesk proporcional e elegante que substitui as antigas monoespaçadas
// (JetBrains Mono / Space Mono) usadas em rótulos, eyebrows, tickers e números.
// Exposta nas variáveis legadas (--font-jetbrains / --font-space-mono) para que
// todas as referências existentes resolvam automaticamente.
const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
    title: 'Mirsui',
    description:
        'Claim your music, bet virals',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${hanken.variable} ${archivo.variable} ${spaceGrotesk.variable} ${hanken.className}`}>
                <GoogleAnalytics />
                <PostHogProvider>
                    <AnalyticsProvider>
                        {children}
                        <Toaster />
                    </AnalyticsProvider>
                </PostHogProvider>
            </body>
        </html>
    )
}
