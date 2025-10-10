// lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Função para rastrear cliques em links externos
export const trackExternalLink = (url: string, linkText: string) => {
  event({
    action: 'click',
    category: 'outbound',
    label: `${linkText} - ${url}`,
  })
}

// Função para rastrear reprodução de música
export const trackMusicPlay = (trackName: string, artistName: string) => {
  event({
    action: 'play',
    category: 'music',
    label: `${artistName} - ${trackName}`,
  })
}

// Função para rastrear claims de tracks
export const trackClaimTrack = (trackName: string, artistName: string) => {
  event({
    action: 'claim',
    category: 'engagement',
    label: `${artistName} - ${trackName}`,
  })
}

// Função para rastrear pesquisas
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'engagement',
    label: searchTerm,
    value: resultsCount,
  })
}