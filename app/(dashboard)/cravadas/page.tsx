import CravadasContent from '@/components/CravadasContent/CravadasContent'
import LandingFooter from '@/components/Footer/LandingFooter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Cravadas - Mirsui',
    description:
        'Crave faixas antes delas bombarem. Quanto mais escondida a faixa, maior o multiplicador.',
}

export default function CravadasPage() {
    return (
        <>
            <CravadasContent />
            <LandingFooter />
        </>
    )
}
