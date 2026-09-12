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

/**
 * A home é ESTÁTICA, regerada a cada dez minutos.
 *
 * Ela era `ƒ (Dynamic)`: renderizava do zero a cada requisição, e cada uma
 * custava 241 KB de egress no Supabase — 20 queries, entre elas cinco páginas
 * de mil linhas para contar gênero. Como o site é aberto e não havia
 * robots.txt, quem pagava esse render eram ~1.700 robôs por hora. Deu 8 GB por
 * dia numa cota de 5 GB por mês.
 *
 * O que forçava o modo dinâmico era o `getUser()` logo abaixo, que lia cookie
 * para mandar quem está logado ao /feed. Uma checagem que interessa a uma
 * dúzia de pessoas por dia obrigava TODO visitante — robô inclusive — a um
 * render personalizado. Essa decisão foi para o middleware, que só paga a
 * validação quando existe cookie de sessão; quem chega sem cookie recebe o
 * HTML do CDN e não toca no banco.
 *
 * DEZ MINUTOS, e não um. Os dados desta página já eram declarados velhos: os
 * achados recentes com 60s (homepageService.ts) e todo o resto com uma hora
 * (homeService.ts). O que muda é só o teto dos achados, e o combinado foi que
 * ninguém repara. A conta que escolheu o número:
 *
 *     revalidate=60   1.440 renders/dia × 241 KB = 347 MB/dia   estoura
 *     revalidate=600    144 renders/dia × 241 KB =  35 MB/dia   cabe folgado
 *
 * (o orçamento é ~170 MB/dia). E regerar é preguiçoso: só acontece se alguém
 * pedir a página depois de vencida, então o custo real é sempre menor que isso.
 */
export const revalidate = 600

export default async function HomePage() {
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
