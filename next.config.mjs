/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['i.scdn.co', 'tqprioqqitimssshcrcr.supabase.co'],
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
