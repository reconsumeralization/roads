import { Analytics } from '@vercel/analytics/react'
import { AnalyticsEvent } from '../analytics'

export class VercelAnalyticsProvider {
  private analytics: typeof Analytics

  constructor() {
    this.analytics = Analytics
  }

  trackEvent(event: AnalyticsEvent) {
    // Map our generic events to Vercel's format
    const vercelEvent = {
      name: `${event.category}:${event.action}`,
      properties: {
        ...event.metadata,
        label: event.label,
        value: event.value,
        timestamp: event.timestamp,
      },
    }

    // Track in Vercel Analytics
    this.analytics.track(vercelEvent.name, vercelEvent.properties)
  }

  // Handle page views automatically
  trackPageView(url: string) {
    this.analytics.track('page_view', {
      path: url,
      timestamp: Date.now(),
    })
  }

  // Track web vitals
  trackWebVital(metric: {
    id: string
    name: string
    value: number
    label: string
  }) {
    this.analytics.track('web_vital', {
      metricId: metric.id,
      name: metric.name,
      value: metric.value,
      label: metric.label,
      timestamp: Date.now(),
    })
  }
}
