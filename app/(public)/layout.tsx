// app/(public)/layout.tsx (Layout do site deslogado - SEM 'use client')
// Fontes, globals.css e o Toaster já vêm do layout raiz.
import LandingFooter from '@/components/Footer/LandingFooter'

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 bg-background text-foreground">
                {children}
            </main>
            <LandingFooter />
        </div>
    )
}
