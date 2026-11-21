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
    let palette: 'grafite' | 'mostarda' | undefined
    if (pathname === '/feed' || pathname === '/feed/') {
        palette = 'grafite'
    } else if (pathname.startsWith('/track/') || pathname.startsWith('/artist/')) {
        palette = 'mostarda'
    }

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
