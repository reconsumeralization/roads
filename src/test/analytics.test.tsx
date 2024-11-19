import { AnalyticsService } from '@/utils/analytics'
import { vi, describe, it, expect, beforeEach } from 'vitest'

describe('AnalyticsService', () => {
  let analytics: AnalyticsService
  let fetchMock: jest.SpyInstance

  beforeEach(() => {
    fetchMock = vi.spyOn(global, 'fetch').mockImplementation()
    analytics = new AnalyticsService('https://api.analytics.com', 'test-key')
    vi.useFakeTimers()
  })

  afterEach(() => {
    fetchMock.mockRestore()
    vi.useRealTimers()
  })

  it('tracks errors with metadata', () => {
    const error = new Error('Test error')
    analytics.trackError(error, { userId: '123' })

    vi.advanceTimersByTime(5000)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.analytics.com',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Test error'),
      })
    )
  })

  it('batches events before sending', () => {
    for (let i = 0; i < 9; i++) {
      analytics.trackInteraction('test')
    }

    expect(fetchMock).not.toHaveBeenCalled()

    analytics.trackInteraction('test')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries failed analytics submissions', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'))
    fetchMock.mockResolvedValueOnce({})

    analytics.trackError(new Error('Test'))
    vi.advanceTimersByTime(5000)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(5000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
