/** @type {import('next').NextConfig} */
const nextConfig = {
    // Empacota em .next/standalone com só os módulos que o runtime traça —
    // 435 MB de node_modules viram algo entre 80 e 150 MB. Ver fase 4 do
    // docs/migracao-para-vps.md.
    output: 'standalone',
    images: {
        // cdn-images.dzcdn.net: capas do Deezer, que é a fonte do Observatório.
        // Sem o domínio aqui o <Image> quebra em runtime — a Pilha escapa disso
        // porque usa <img> cru, mas a landing passa pelo otimizador.
        domains: [
            'i.scdn.co',
            'cdn-images.dzcdn.net',
            // db.mirsui.com: o Storage self-hosted, para onde as imagens de
            // usuário apontam agora. O host antigo continua aqui de propósito
            // enquanto os 12 arquivos não vierem da nuvem — ver fase 9 do
            // docs/migracao-para-vps.md. Só sai depois do resgate.
            'db.mirsui.com',
            'tqprioqqitimssshcrcr.supabase.co',
        ],
    },
    // Reverse proxy do PostHog: o client envia eventos para /ingest (mesmo domínio),
    // o que evita que adblockers bloqueiem o tracking. Recomendado pela PostHog.
    // Ajuste o host para eu.i.posthog.com se o projeto estiver na região EU.
    async rewrites() {
        return [
            {
                source: '/ingest/static/:path*',
                destination: 'https://us-assets.i.posthog.com/static/:path*',
            },
            {
                source: '/ingest/:path*',
                destination: 'https://us.i.posthog.com/:path*',
            },
        ]
    },
    // Necessário para o reverse proxy do PostHog funcionar com trailing slashes.
    skipTrailingSlashRedirect: true,
}

export default nextConfig
