import StakesContent from '@/components/StakesContent/StakesContent'
import LandingFooter from '@/components/Footer/LandingFooter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Stakes - Mirsui',
    description:
        'Dê stake em faixas antes delas bombarem. Quanto mais escondida a faixa, maior o multiplicador.',
}

export default function StakesPage() {
    return (
        <>
            <StakesContent />
            <LandingFooter />
        </>
    )
}
