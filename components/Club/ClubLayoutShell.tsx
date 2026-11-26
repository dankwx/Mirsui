'use client'

import { usePathname } from 'next/navigation'
import type { SessionUserProfile } from '@/lib/sessionProfile'
import ClubFooter from '@/components/Landing/ClubFooter'
import Cavando from './Cavando'
import ClubHeader from './ClubHeader'
import ClubShell from './ClubShell'
import palettes from './ClubPalettes.module.css'

export default function ClubLayoutShell({
    children,
    userProfile,
    isDono,
    mostarda = false,
}: {
    children: React.ReactNode
    userProfile: SessionUserProfile | null
    isDono: boolean
    /** força a paleta mostarda fora das rotas da lista (a 404 da raiz) */
    mostarda?: boolean
}) {
    const pathname = usePathname()
    const palette =
        mostarda ||
        pathname === '/feed' ||
        pathname === '/feed/' ||
        pathname === '/pilha' ||
        pathname === '/pilha/' ||
        pathname === '/stakes' ||
        pathname === '/stakes/' ||
        pathname === '/emails' ||
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
            <Cavando />
        </ClubShell>
    )
}
