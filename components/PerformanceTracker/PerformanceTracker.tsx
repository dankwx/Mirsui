'use client'

import { useEffect } from 'react'
import { event } from '@/lib/gtag'

interface PerformanceTrackerProps {
  children: React.ReactNode
}

export default function PerformanceTracker({ children }: PerformanceTrackerProps) {
  useEffect(() => {
    // Rastrear Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // First Contentful Paint (FCP)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            event({
              action: 'timing_complete',
              category: 'performance',
              label: 'FCP',
              value: Math.round(entry.startTime)
            })
          }
        })
      })

      observer.observe({ entryTypes: ['paint'] })

      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        event({
          action: 'timing_complete',
          category: 'performance',
          label: 'LCP',
          value: Math.round(lastEntry.startTime)
        })
      })

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Cleanup
      return () => {
        observer.disconnect()
        lcpObserver.disconnect()
      }
    }
  }, [])

  // Rastrear tempo na página quando componente desmonta
  useEffect(() => {
    const startTime = Date.now()
    
    return () => {
      const timeOnPage = Date.now() - startTime
      if (timeOnPage > 1000) { // Apenas se ficar mais de 1 segundo
        event({
          action: 'timing_complete',
          category: 'engagement',
          label: 'time_on_page',
          value: Math.round(timeOnPage / 1000) // converter para segundos
        })
      }
    }
  }, [])

  return <>{children}</>
}