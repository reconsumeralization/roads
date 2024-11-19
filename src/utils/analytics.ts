import { VercelAnalyticsProvider } from './analytics-providers/vercel'

export type AnalyticsEvent = {
  category: 'error' | 'performance' | 'interaction'
  action: string
  label?: string
  value?: number
  metadata?: Record<string, any>
  timestamp: number
}

export type AnalyticsProvider = {
  trackEvent: (event: AnalyticsEvent) => void
  trackPageView?: (url: string) => void
  trackWebVital?: (metric: any) => void
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = []
  private batchSize: number = 10
  private flushInterval: number = 5000
  private providers: AnalyticsProvider[] = []

  constructor(
    private readonly endpoint: string,
    private readonly apiKey: string,
    config?: {
      enableVercel?: boolean
      batchSize?: number
      flushInterval?: number
    }
  ) {
    this.batchSize = config?.batchSize ?? 10
    this.flushInterval = config?.flushInterval ?? 5000

    if (config?.enableVercel) {
      this.providers.push(new VercelAnalyticsProvider())
    }

    this.setupAutoFlush()
  }

  trackError(error: Error, metadata?: Record<string, any>) {
    this.track({
      category: 'error',
      action: error.name,
      label: error.message,
      metadata: {
        ...metadata,
        stack: error.stack,
        code: 'code' in error ? (error as any).code : undefined,
      },
    })
  }

  trackPerformance(
    metric: { type: string; duration: number },
    metadata?: Record<string, any>
  ) {
    this.track({
      category: 'performance',
      action: metric.type,
      value: metric.duration,
      metadata,
    })
  }

  trackPageView(url: string) {
    // Track in all providers that support page views
    this.providers.forEach((provider) => {
      provider.trackPageView?.(url)
    })

    this.track({
      category: 'interaction',
      action: 'page_view',
      label: url,
    })
  }

  trackWebVital(metric: any) {
    // Track in all providers that support web vitals
    this.providers.forEach((provider) => {
      provider.trackWebVital?.(metric)
    })

    this.track({
      category: 'performance',
      action: 'web_vital',
      label: metric.name,
      value: metric.value,
      metadata: {
        id: metric.id,
        label: metric.label,
      },
    })
  }

  private track(event: Omit<AnalyticsEvent, 'timestamp'>) {
    const fullEvent = {
      ...event,
      timestamp: Date.now(),
    }

    // Track in all providers
    this.providers.forEach((provider) => {
      provider.trackEvent(fullEvent)
    })

    this.events.push(fullEvent)

    if (this.events.length >= this.batchSize) {
      this.flush()
    }
  }

  private async flush() {
    if (!this.events.length) return

    const eventsToSend = [...this.events]
    this.events = []

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ events: eventsToSend }),
      })
    } catch (error) {
      // Store failed events for retry
      this.events.unshift(...eventsToSend)
      console.error('Failed to send analytics:', error)
    }
  }

  private setupAutoFlush() {
    setInterval(() => this.flush(), this.flushInterval)
  }
}
