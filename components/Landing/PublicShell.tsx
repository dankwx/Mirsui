'use client'

import { usePathname } from 'next/navigation'
import LandingFooter from '@/components/Footer/LandingFooter'
import ClubFooter from './ClubFooter'
import ClubShell from '@/components/Club/ClubShell'
import styles from './Club.module.css'

/** Keep the redesign on the home; legal pages retain their existing chrome. */
export default function PublicShell({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    if (pathname !== '/') {
        return (
            <div className="flex min-h-screen flex-col">
                <main className="flex-1 bg-background text-foreground">
                    {children}
                </main>
                <LandingFooter />
            </div>
        )
    }
    return (
        <ClubShell>
            <main>{children}</main>
            <ClubFooter />
        </ClubShell>
    )
}
