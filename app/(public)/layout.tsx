// app/layout.tsx (Layout raiz - SEM 'use client')
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { Toaster } from '@/components/ui/toaster'
import Footer from '@/components/Footer/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'SoundSage',
    description:
        'Claim your music and prove that you litened to it before it got popular',
}

export default function DashboardFooter({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 bg-background text-foreground">
                {children}
            </main>
            <Footer />
        </div>
    )
}
