import { getRecentActivity } from '@/utils/homepageService'
import { getGenerosDoAcervo, getPessoasDaCena } from '@/utils/homeService'
import Hero from '@/components/Landing/Hero'
import Cena from '@/components/Landing/Cena'
import Acervo from '@/components/Landing/Acervo'
import ComoFunciona from '@/components/Landing/ComoFunciona'
import Fechamento from '@/components/Landing/Fechamento'
import type { Metadata } from 'next'

const TITLE = 'mirsui'
const DESCRIPTION =
    'Salve a música antes dela estourar. Fica registrado que a descoberta foi sua.'

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Mirsui',
        title: TITLE,
        description: DESCRIPTION,
        url: '/',
        images: [{ url: '/api/og/landing', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/api/og/landing'],
    },
}

// Keep the anonymous home static: cookie/session redirects belong in middleware.
// Ten-minute ISR avoids querying the catalogue on every crawler request.
export const revalidate = 600

export default async function HomePage() {
    const [generos, achados, pessoas] = await Promise.all([
        getGenerosDoAcervo(6, 6),
        getRecentActivity(4),
        getPessoasDaCena(4),
    ])

    return (
        <>
            <Hero />
            <Acervo generos={generos} />
            <ComoFunciona />
            <Cena achados={achados} pessoas={pessoas} />
            <Fechamento />
        </>
    )
}
