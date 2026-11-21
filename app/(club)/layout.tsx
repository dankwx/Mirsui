import { AuthProvider } from '@/components/AuthProvider/AuthProvider'
import ClubLayoutShell from '@/components/Club/ClubLayoutShell'
import { getSessionProfile } from '@/lib/sessionProfile'

export default async function ClubLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userProfile, dono } = await getSessionProfile()

    return (
        <AuthProvider>
            <ClubLayoutShell userProfile={userProfile} isDono={dono}>
                {children}
            </ClubLayoutShell>
        </AuthProvider>
    )
}
