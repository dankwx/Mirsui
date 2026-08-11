/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // cdn-images.dzcdn.net: capas do Deezer, que é a fonte do Observatório.
        // Sem o domínio aqui o <Image> quebra em runtime — a Pilha escapa disso
        // porque usa <img> cru, mas a landing passa pelo otimizador.
        domains: [
            'i.scdn.co',
            'cdn-images.dzcdn.net',
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
