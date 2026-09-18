import { AuthProvider } from '@/components/AuthProvider/AuthProvider'
import ClubHeader from '@/components/Club/ClubHeader'
import ClubShell from '@/components/Club/ClubShell'
import ClubFooter from '@/components/Landing/ClubFooter'
import { getSessionProfile } from '@/lib/sessionProfile'

export default async function ClubLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userProfile, dono } = await getSessionProfile()

    return (
        <AuthProvider>
            <ClubShell>
                <ClubHeader userProfile={userProfile} isDono={dono} />
                <main style={{ flex: 1 }}>{children}</main>
                <ClubFooter compact />
            </ClubShell>
        </AuthProvider>
    )
}
