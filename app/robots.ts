import type { MetadataRoute } from 'next'

/**
 * O robots.txt.
 *
 * Até agora não existia nenhum, e `/robots.txt` caía no 404 do Next — uma
 * página inteira renderizada, 40 KB, para responder a pergunta mais barata que
 * um crawler faz. Sem arquivo, "não existe regra" e todo robô do mundo varre
 * tudo: nas 6 horas em que isto foi medido eram ~1.700 renders da home e
 * ~3.800 páginas de faixa POR HORA, praticamente nenhum com cookie. Foi isso
 * que estourou as três cotas do plano gratuito.
 *
 * ISTO NÃO PIORA O SEO. É a preocupação óbvia ao escrever este arquivo, então
 * fica registrado o raciocínio, regra por regra:
 *
 *   1. Googlebot e Bingbot continuam com acesso total ao conteúdo. Nada do que
 *      é indexável foi bloqueado.
 *
 *   2. `Google-Extended` NÃO é o Googlebot. É o controle separado que o Google
 *      criou para treino do Gemini/Vertex, e a documentação deles diz
 *      explicitamente que bloqueá-lo não afeta ranking nem indexação na Busca.
 *      Mesma coisa com `Applebot-Extended`: o `Applebot` normal, que alimenta
 *      Siri e Spotlight, segue liberado.
 *
 *   3. Bloquear scraper de IA na prática AJUDA. Crawl budget é finito: quando
 *      um servidor gasta a capacidade servindo scraper, o Googlebot rasteja
 *      menos e mais devagar. Tirar o ruído é dar a vez para quem indexa.
 *
 *   4. Os crawlers de preview — WhatsApp, Twitter, Facebook, Telegram,
 *      Discord, Slack, LinkedIn — ficam liberados de propósito. Link de faixa
 *      mandado no WhatsApp é o único canal de crescimento que um site deste
 *      tamanho tem (é o mesmo motivo que destrancou o middleware), e preview
 *      quebrado mata esse canal.
 */

/**
 * Robôs que existem para treinar modelo, não para mandar gente para cá.
 * Não devolvem visita, tráfego nem ranking — só consomem cota.
 */
const SCRAPERS_DE_IA = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-Web',
    'anthropic-ai',
    'CCBot',
    'Google-Extended',
    'Applebot-Extended',
    'PerplexityBot',
    'Bytespider',
    'Amazonbot',
    'FacebookBot',
    'Meta-ExternalAgent',
    'Meta-ExternalFetcher',
    'cohere-ai',
    'Diffbot',
    'ImagesiftBot',
    'Omgilibot',
    'Timpibot',
    'YouBot',
    'PanguBot',
    'Scrapy',
]

/**
 * Ferramentas de auditoria de SEO. Rastejam o site inteiro para montar índice
 * de backlink de terceiro, e são das mais pesadas que existem.
 *
 * Se algum dia você contratar Ahrefs ou Semrush para auditar o Mirsui, tire o
 * nome daqui — a ferramenta precisa entrar para funcionar.
 */
const FERRAMENTAS_DE_SEO = [
    'AhrefsBot',
    'SemrushBot',
    'MJ12bot',
    'DotBot',
    'DataForSeoBot',
    'BLEXBot',
    'PetalBot',
]

/**
 * Onde nenhum robô tem o que fazer.
 *
 * `/api/og/` é a exceção que precisa vir ANTES do `/api/`: é de lá que sai a
 * imagem de compartilhamento, e os crawlers de preview respeitam robots.txt.
 * Bloquear a pasta inteira apagaria o preview de todo link do Mirsui.
 *
 * O `/*?redirect=` limpa as variantes da home criadas pelo middleware quando
 * alguém deslogado tenta abrir uma rota privada. O `canonical` da página já
 * aponta para `/`, mas não há motivo para gastar crawl budget nelas.
 */
const SEM_SERVENTIA = [
    '/api/',
    '/auth/',
    '/admin',
    '/stakes',
    '/ingest',
    '/reset-password',
    '/*?redirect=',
]

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/api/og/'],
                disallow: SEM_SERVENTIA,
            },
            {
                userAgent: SCRAPERS_DE_IA,
                disallow: '/',
            },
            {
                userAgent: FERRAMENTAS_DE_SEO,
                disallow: '/',
            },
        ],
    }
}
