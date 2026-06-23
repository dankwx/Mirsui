'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import posthog, {
    POSTHOG_KEY,
    POSTHOG_HOST,
    POSTHOG_UI_HOST,
    isPosthogEnabled,
} from '@/lib/posthog'

// Inicializa o PostHog uma única vez no client.
if (typeof window !== 'undefined' && isPosthogEnabled && !posthog.__loaded) {
    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        ui_host: POSTHOG_UI_HOST,
        // Captura automática de cliques, inputs e submits (autocapture).
        autocapture: true,
        // Desligamos o pageview automático: como é SPA (App Router), capturamos
        // manualmente em cada mudança de rota no componente abaixo.
        capture_pageview: false,
        // Mede tempo gasto / saída da página.
        capture_pageleave: true,
        // Onde guardar o distinct_id do visitante.
        persistence: 'localStorage+cookie',
        // Aplica os defaults recomendados pelo PostHog nessa versão.
        defaults: '2026-05-30',
    })
}

// Dispara um $pageview a cada navegação do App Router.
function PostHogPageView() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!pathname || !isPosthogEnabled) return
        let url = window.origin + pathname
        const qs = searchParams?.toString()
        if (qs) url += `?${qs}`
        posthog.capture('$pageview', { $current_url: url })
    }, [pathname, searchParams])

    return null
}

export default function PostHogProvider({
    children,
}: {
    children: React.ReactNode
}) {
    if (!isPosthogEnabled) {
        // Sem chave configurada: não embrulha nada, app segue normal.
        return <>{children}</>
    }

    return (
        <PHProvider client={posthog}>
            <Suspense fallback={null}>
                <PostHogPageView />
            </Suspense>
            {children}
        </PHProvider>
    )
}
