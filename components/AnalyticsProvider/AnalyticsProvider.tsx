'use client'

import { Suspense } from 'react'
import useAnalytics from '@/hooks/use-analytics'

function AnalyticsTracker() {
  useAnalytics()
  return null
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </>
  )
}