// types/gtag.d.ts
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: {
        page_location?: string
        event_category?: string
        event_label?: string
        value?: number
      }
    ) => void
    dataLayer: any[]
  }
}

export {}