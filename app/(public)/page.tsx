import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getTrendingTracks, getRecentActivity } from '@/utils/homepageService'
import { getLandingObservatory } from '@/utils/observatoryService'
import Hero from '@/components/Landing/Hero'
import Escala from '@/components/Landing/Escala'
import ComoFunciona from '@/components/Landing/ComoFunciona'
import Parede from '@/components/Landing/Parede'
import Fechamento from '@/components/Landing/Fechamento'
import type { Metadata } from 'next'

/**
 * A home.
 *
 * A versão anterior abria com uma fotografia em tela cheia e vendia o produto
 * por atmosfera. Era bonita, mas podia ser a home de qualquer app de música: a
 * foto não dizia o que o Mirsui faz que os outros não fazem.
 *
 * Esta versão abre com o registro. A coluna da direita do hero traz os últimos
 * salvamentos reais, com posição, nome e data vindos do banco — o produto em
 * vez da promessa dele. O resto da página segue a mesma regra: todo número na
 * tela existe no banco.
 *
 * As rotas, os títulos de metadata e o redirect de quem já está logado seguem
 * exatamente como estavam, porque mexer neles é mexer em SEO.
 */

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

export default async function HomePage() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
        redirect('/feed')
    }

    const [trendingTracks, recentActivity, observatorio] = await Promise.all([
        getTrendingTracks(10),
        getRecentActivity(8),
        getLandingObservatory(10),
    ])

    return (
        <div className="min-h-screen bg-mir-bg text-mir-text">
            <span aria-hidden="true" className="mir-grain" />

            <Hero atividade={recentActivity} />

            {/* As duas seções guiadas por dado só entram quando o dado existe:
                uma home com "0 faixas medidas" vende o contrário do que quer. */}
            {observatorio && observatorio.medidas > 0 && (
                <Escala observatorio={observatorio} />
            )}

            <ComoFunciona faixas={trendingTracks} />
            <Parede faixas={trendingTracks} />
            <Fechamento />
            {/* Sem <LandingFooter /> aqui: quem monta o rodapé é o
                app/(public)/layout.tsx, para todas as páginas deslogadas. */}
        </div>
    )
}
