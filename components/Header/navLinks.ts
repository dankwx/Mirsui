export type NavLink = {
    title: string
    url: string
    match: (pathname: string) => boolean
}

/* Vocabulário do produto (vale para toda copy visível):
 *
 *   salvar / salva      a ação grátis e ilimitada de marcar que ouviu cedo.
 *                       Verbo de botão, deliberadamente sem sabor: é o texto
 *                       mais lido do app e palavra "criativa" cansa em alta
 *                       frequência.
 *   achado              o substantivo da mesma coisa ("meus achados").
 *   acervo              onde os achados ficam. "412 no acervo" é a contagem.
 *   ficha / botar ficha a aposta com vaga limitada, trava e multiplicador.
 *                       Vem de "botar as fichas em", que em português falado já
 *                       significa apoiar com convicção. Rota segue /stakes; só
 *                       o rótulo é português.
 *   Faro                a pontuação. Ainda sem página própria, então fora
 *                       da nav por enquanto.
 *
 * Aposentados: carimbar/carimbo, claim/Claim, reivindicar, despacho, cravar/
 * cravada, stake como verbo ("dê stake"). Identificadores, rotas e campos de
 * banco seguem em claim/stake de propósito: renomear aquilo exige o backend.
 */

export const navLinks: NavLink[] = [
    {
        title: 'Início',
        url: '/',
        match: (p) => p === '/' || p.startsWith('/feed'),
    },
    {
        title: 'A pilha',
        url: '/pilha',
        match: (p) => p.startsWith('/pilha'),
    },
    {
        title: 'Fichas',
        url: '/stakes',
        match: (p) => p.startsWith('/stakes'),
    },
]

/*
 * O conteúdo do site abriu para visitantes, mas /pilha e /stakes seguem
 * exigindo login. "Início" continua sendo a landing para quem chega sem
 * sessão, então o feed ganha o item próprio "Achados".
 */
export const navLinksVisitante: NavLink[] = [
    {
        title: 'Início',
        url: '/',
        match: (p) => p === '/',
    },
    {
        title: 'Achados',
        url: '/feed',
        match: (p) => p.startsWith('/feed'),
    },
    {
        title: 'A pilha',
        url: '/pilha',
        match: (p) => p.startsWith('/pilha'),
    },
]
