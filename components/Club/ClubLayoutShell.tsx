'use client'

import { usePathname } from 'next/navigation'
import type { SessionUserProfile } from '@/lib/sessionProfile'
import ClubFooter from '@/components/Landing/ClubFooter'
import ClubHeader from './ClubHeader'
import ClubShell from './ClubShell'
import palettes from './ClubPalettes.module.css'

export default function ClubLayoutShell({
    children,
    userProfile,
    isDono,
}: {
    children: React.ReactNode
    userProfile: SessionUserProfile | null
    isDono: boolean
}) {
    const pathname = usePathname()
    const palette =
        pathname === '/feed' ||
        pathname === '/feed/' ||
        pathname === '/pilha' ||
        pathname === '/pilha/' ||
        pathname === '/stakes' ||
        pathname === '/stakes/' ||
        pathname.startsWith('/track/') ||
        pathname.startsWith('/artist/') ||
        pathname.startsWith('/user/')
            ? 'mostarda'
            : undefined

    return (
        <ClubShell
            className={palette ? palettes.palette : undefined}
            palette={palette}
        >
            <ClubHeader userProfile={userProfile} isDono={isDono} />
            <main style={{ flex: 1 }}>{children}</main>
            <ClubFooter compact />
        </ClubShell>
    )
}
