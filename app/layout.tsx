// app/layout.tsx (Layout raiz - SEM 'use client')
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Footer from '@/components/Footer/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics/GoogleAnalytics'
import AnalyticsProvider from '@/components/AnalyticsProvider/AnalyticsProvider'

const inter = Inter({ subsets: ['latin'] })

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
            <body className={inter.className}>
                <GoogleAnalytics />
                <AnalyticsProvider>
                    {children}
                    <Toaster />
                </AnalyticsProvider>
            </body>
        </html>
    )
}
