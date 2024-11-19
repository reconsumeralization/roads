import { AnalyticsService } from '@/utils/analytics'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Analytics } from '@vercel/analytics/react'

vi.mock('@vercel/analytics/react', () => ({
  Analytics: {
    track: vi.fn(),
  },
}))

describe('AnalyticsService with Vercel', () => {
  let analytics: AnalyticsService

  beforeEach(() => {
    analytics = new AnalyticsService('https://api.analytics.com', 'test-key', {
      enableVercel: true,
    })
    vi.clearAllMocks()
  })

  it('tracks errors in Vercel Analytics', () => {
    const error = new Error('Test error')
    analytics.trackError(error, { userId: '123' })

    expect(Analytics.track).toHaveBeenCalledWith(
      'error:Error',
      expect.objectContaining({
        label: 'Test error',
        userId: '123',
      })
    )
  })

  it('tracks page views in Vercel Analytics', () => {
    analytics.trackPageView('/test-page')

    expect(Analytics.track).toHaveBeenCalledWith(
      'page_view',
      expect.objectContaining({
        path: '/test-page',
      })
    )
  })

  it('tracks web vitals in Vercel Analytics', () => {
    const metric = {
      id: 'test-id',
      name: 'FCP',
      value: 1000,
      label: 'web-vital',
    }

    analytics.trackWebVital(metric)

    expect(Analytics.track).toHaveBeenCalledWith(
      'web_vital',
      expect.objectContaining({
        metricId: 'test-id',
        name: 'FCP',
        value: 1000,
      })
    )
  })
})
