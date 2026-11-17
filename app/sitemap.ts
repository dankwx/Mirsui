import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'
import { entradasDoSitemap } from '@/utils/sitemapService'

/**
 * O sitemap.xml.
 *
 * A régua do que entra — e por que não é o catálogo inteiro — está em
 * `utils/sitemapService.ts`. Aqui só se junta as páginas fixas com o que veio
 * do banco.
 *
 * Dinâmico de propósito: gerado no build, uma falha de banco na hora do deploy
 * quebraria o deploy inteiro. O custo fica no `unstable_cache` do serviço, que
 * monta uma vez por dia.
 *
 * Sem `priority` nem `changeFrequency`: o Google ignora os dois. O `lastmod`
 * só aparece onde o banco tem uma data de verdade, porque `lastmod` mentiroso
 * é o que faz o Google parar de confiar nele.
 */
export const dynamic = 'force-dynamic'

const FIXAS = ['/', '/pilha', '/feed', '/termos', '/privacidade']

function absoluta(caminho: string): string {
    return caminho === '/' ? siteUrl : `${siteUrl}${caminho}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const fixas: MetadataRoute.Sitemap = FIXAS.map((c) => ({ url: absoluta(c) }))

    try {
        const entradas = await entradasDoSitemap()
        return [
            ...fixas,
            ...entradas.map((e) => ({
                url: absoluta(e.caminho),
                ...(e.modificadoEm
                    ? { lastModified: new Date(e.modificadoEm) }
                    : {}),
            })),
        ]
    } catch (erro) {
        // Sem banco, as páginas fixas ainda são verdade. A resposta não é
        // guardada, então o próximo pedido tenta de novo.
        console.error('[sitemap] falha ao montar:', erro)
        return fixas
    }
}
