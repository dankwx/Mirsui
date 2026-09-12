/** URL pública do site, usada em metadataBase e nas imagens de compartilhamento. */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mirsui.com'

/**
 * Origem pública da requisição — `https://www.mirsui.com` em produção,
 * `http://localhost:3001` no `next dev` — para montar redirects absolutos.
 *
 * Não dá para tirar isso de `request.url`. Atrás do nginx, o Next monta a URL
 * que o middleware e as route handlers enxergam a partir do bind do próprio
 * servidor (`HOSTNAME=127.0.0.1 PORT=3002`, ver docs/migracao-para-vps.md),
 * e ainda troca o 127.0.0.1 por `localhost` no caminho. Um
 * `new URL('/feed', request.url)` vira `https://localhost:3002/feed`, e foi
 * exatamente para lá que o login em produção mandou as pessoas. Na Vercel o
 * problema nunca apareceu porque lá o host da requisição era o público.
 *
 * O que atravessa o proxy intacto são os cabeçalhos: o nginx manda
 * `X-Forwarded-Host` e `X-Forwarded-Proto` (/etc/nginx/sites-available/
 * mirsui-web), e quando ninguém os manda o próprio Next os preenche a partir
 * do `Host` e do socket — é por isso que no `next dev` sai `http://localhost:3001`
 * sem configuração nenhuma. Só se lê o primeiro valor: com mais de um proxy
 * na frente o cabeçalho vira uma lista separada por vírgula.
 */
export function origemPublica(headers: Headers): string {
    const primeiro = (nome: string) =>
        headers.get(nome)?.split(',')[0].trim() || undefined

    const host = primeiro('x-forwarded-host') ?? primeiro('host')
    if (!host) return siteUrl

    const proto = primeiro('x-forwarded-proto') ?? 'http'
    return `${proto}://${host}`
}
