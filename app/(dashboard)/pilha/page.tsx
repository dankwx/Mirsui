import type { Metadata } from 'next'
import Pile from '@/components/Pile/Pile'
import LandingFooter from '@/components/Footer/LandingFooter'
import { getPileTracks } from '@/utils/pileService'

export const metadata: Metadata = {
    title: 'A pilha - Mirsui',
    description: 'Tudo que a cena carimbou, despejado num lugar só.',
}

export default function PilhaPage() {
    const tracks = getPileTracks()

    return (
        <div className="flex min-h-[calc(100dvh-72px)] flex-col">
            <div className="flex-1">
                <Pile tracks={tracks} />
            </div>
            <LandingFooter compact />
        </div>
    )
}
