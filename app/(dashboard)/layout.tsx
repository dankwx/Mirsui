// app/(dashboard)/layout.tsx (Layout para páginas com Header/Sidebar)
import Header from '@/components/Header/Header'
import Sidebar from '@/components/Sidebar/Sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
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
    )
}
