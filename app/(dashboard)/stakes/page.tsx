import StakesContent, { type Stake } from '@/components/StakesContent/StakesContent'
import LandingFooter from '@/components/Footer/LandingFooter'
import { getStakesData } from './get-stakes'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Stakes - Mirsui',
    description:
        'Dê stake em faixas antes delas bombarem. Quanto mais escondida a faixa, maior o multiplicador.',
}

// Depende da sessão (cookies) → sempre renderiza no servidor com dados frescos.
export const dynamic = 'force-dynamic'

export default async function StakesPage() {
    const { stakes, points } = await getStakesData()

    return (
        <>
            <StakesContent
                initialStakes={stakes as Stake[]}
                initialPoints={points}
            />
            <LandingFooter />
        </>
    )
}
