// layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'

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
                <div className="grid h-screen w-screen grid-cols-[auto_1fr] grid-rows-1 overflow-hidden">
                    {/* Sidebar - ocupa toda altura da tela */}
                    <Sidebar />

                    {/* Área principal - header + conteúdo */}
                    <div className="flex min-h-0 flex-col overflow-hidden">
                        {/* Header fixo */}
                        <Header />

                        {/* Conteúdo com scroll */}
                        <main className="flex-1 overflow-y-auto bg-background text-foreground">
                            {children}
                        </main>
                    </div>
                </div>
                <Toaster />
            </body>
        </html>
    )
}
