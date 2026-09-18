// app/(dashboard)/layout.tsx
import Header from '@/components/Header/Header'
import { AuthProvider } from '@/components/AuthProvider/AuthProvider'
import { getSessionProfile } from '@/lib/sessionProfile'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userProfile, dono } = await getSessionProfile()

    return (
        <AuthProvider>
            <div className="min-h-screen bg-mir-bg font-sans text-mir-text">
                <Header userProfile={userProfile} isDono={dono} />
                <main className="relative">{children}</main>
                <div className="mir-grain" aria-hidden="true" />
            </div>
        </AuthProvider>
    )
}
