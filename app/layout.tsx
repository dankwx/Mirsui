// app/layout.tsx (Layout raiz - SEM 'use client')
import type { Metadata } from 'next'
import { Archivo, Hanken_Grotesk, JetBrains_Mono, Space_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Footer from '@/components/Footer/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics/GoogleAnalytics'
import AnalyticsProvider from '@/components/AnalyticsProvider/AnalyticsProvider'

const hanken = Hanken_Grotesk({
    subsets: ['latin'],
    variable: '--font-hanken',
})
const jetbrains = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-jetbrains',
})
const archivo = Archivo({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
    variable: '--font-archivo',
})
const spaceMono = Space_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-space-mono',
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
            <body className={`${hanken.variable} ${jetbrains.variable} ${archivo.variable} ${spaceMono.variable} ${hanken.className}`}>
                <GoogleAnalytics />
                <AnalyticsProvider>
                    {children}
                    <Toaster />
                </AnalyticsProvider>
            </body>
        </html>
    )
}
