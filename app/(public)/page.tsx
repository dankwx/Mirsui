import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getRecentActivity } from '@/utils/homepageService'
import { getLandingObservatory } from '@/utils/observatoryService'
import {
    getParedeDoAcervo,
    getGenerosDoAcervo,
    getPessoasDaCena,
} from '@/utils/homeService'
import Hero from '@/components/Landing/Hero'
import Cena from '@/components/Landing/Cena'
import Acervo from '@/components/Landing/Acervo'
import Fechamento from '@/components/Landing/Fechamento'
import type { Metadata } from 'next'

/**
 * A home.
 *
 * Duas versões ficaram pelo caminho. A primeira vendia por atmosfera: foto em
 * tela cheia e um argumento por seção. A segunda trocou a foto pelo registro,
 * mas manteve o esqueleto de folheto — manchete, prova, como funciona,
 * vitrine, manifesto, botão.
 *
 * Esta abandona o esqueleto. A referência é a home deslogada do Letterboxd,
 * que não é uma página sobre o produto: é o produto destrancado, com as
 * resenhas de gente real e uma centena de pôsteres na tela. O que dá a
 * sensação de lugar inteiro é volume de conteúdo e presença de gente, não
 * qualidade de argumento.
 *
 * O Mirsui não tem o volume social do Letterboxd (são cinco pessoas e algumas
 * dezenas de salvamentos), mas tem 2.994 faixas medidas todo dia, todas com
 * capa. Então o acervo é quem enche a página, e a camada de gente aparece do
 * tamanho real que tem — sem inventar usuário, que é a mentira que qualquer
 * clique desmentiria.
 *
 * Metadata, rotas e o redirect de quem já está logado seguem como estavam:
 * mexer neles é mexer em SEO.
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

    const [mosaico, generos, achados, pessoas, observatorio] = await Promise.all([
        getParedeDoAcervo(60),
        getGenerosDoAcervo(8, 8),
        getRecentActivity(6),
        getPessoasDaCena(6),
        getLandingObservatory(1),
    ])

    return (
        <div className="min-h-screen bg-mir-bg text-mir-text">
            <span aria-hidden="true" className="mir-grain" />

            <Hero mosaico={mosaico} medidas={observatorio?.medidas ?? 0} />
            <Cena achados={achados} pessoas={pessoas} />
            <Acervo generos={generos} />
            <Fechamento />
            {/* Sem <LandingFooter /> aqui: quem monta o rodapé é o
                app/(public)/layout.tsx, para todas as páginas deslogadas. */}
        </div>
    )
}
