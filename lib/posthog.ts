// lib/posthog.ts
// Configuração central do PostHog (analytics de produto).
// A chave é pública por design (igual ao GA) — a proteção vem do projeto/host.
import posthog from 'posthog-js'

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ''
// Host de ingestão. Em produção passamos pelo reverse proxy ('/ingest') configurado
// no next.config.mjs, o que evita bloqueio por adblockers (recomendação do PostHog).
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || '/ingest'
// Host da UI (usado para gerar links no toolbar). Por padrão US Cloud.
export const POSTHOG_UI_HOST =
    process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || 'https://us.posthog.com'

export const isPosthogEnabled = POSTHOG_KEY !== ''

/**
 * Captura um evento de forma segura: vira no-op se o PostHog não estiver
 * carregado (chave ausente, ainda inicializando, ou rodando no servidor).
 * Use sempre este helper em vez de `posthog.capture` direto.
 */
export function capture(event: string, properties?: Record<string, unknown>) {
    if (typeof window === 'undefined') return
    if (!isPosthogEnabled || !posthog.__loaded) return
    posthog.capture(event, properties)
}

/** Vincula os eventos a um usuário identificado (chamar após login). */
export function identify(distinctId: string, properties?: Record<string, unknown>) {
    if (typeof window === 'undefined') return
    if (!isPosthogEnabled || !posthog.__loaded) return
    posthog.identify(distinctId, properties)
}

/** Reseta a identidade (chamar no logout). */
export function resetIdentity() {
    if (typeof window === 'undefined') return
    if (!isPosthogEnabled || !posthog.__loaded) return
    posthog.reset()
}

export default posthog
