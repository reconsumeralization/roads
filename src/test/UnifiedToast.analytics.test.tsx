import { render, act, fireEvent } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { Analytics } from '@/utils/analytics'
import { webVitals } from '@/utils/web-vitals'

describe('UnifiedToast Analytics', () => {
  let analytics: Analytics

  beforeEach(() => {
    analytics = {
      trackEvent: vi.fn(),
      trackError: vi.fn(),
      trackPerformance: vi.fn(),
    }
  })

  it('tracks toast lifecycle events', async () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'analytics-test',
          title: 'Analytics Test',
          duration: 2000,
        }}
        onDismiss={() => {}}
        analytics={analytics}
      />
    )

    // Verify appearance tracking (references ```typescript:src/components/UnifiedToast.tsx startLine: 173 endLine: 193```)
    expect(analytics.trackEvent).toHaveBeenCalledWith('toast_shown', {
      toastId: 'analytics-test',
      variant: 'default',
    })

    // Test interaction tracking (references ```typescript:src/components/UnifiedToast.tsx startLine: 120 endLine: 141```)
    await act(async () => {
      fireEvent.mouseEnter(container.querySelector('[role="alert"]')!)
    })
    expect(analytics.trackEvent).toHaveBeenCalledWith('toast_interaction', {
      type: 'hover',
      toastId: 'analytics-test',
    })
  })

  it('tracks performance metrics', async () => {
    const { rerender } = render(
      <UnifiedToast
        toast={{
          id: 'perf-test',
          title: 'Performance Test',
          duration: 2000,
        }}
        onDismiss={() => {}}
        analytics={analytics}
      />
    )

    // Track render performance
    expect(analytics.trackPerformance).toHaveBeenCalledWith('toast_render_time')

    // Track animation performance (references ```typescript:src/components/UnifiedToast.tsx startLine: 196 endLine: 201```)
    expect(analytics.trackPerformance).toHaveBeenCalledWith(
      'toast_animation_fps'
    )
  })

  it('tracks error events', async () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'error-test',
          title: 'Error Test',
        }}
        onDismiss={() => {}}
        analytics={analytics}
      />
    )

    // Test error tracking (references ```typescript:src/components/UnifiedToast.tsx startLine: 82 endLine: 89```)
    await act(async () => {
      const error = new Error('Test error')
      fireEvent(
        container.querySelector('[role="alert"]')!,
        new CustomEvent('error', { detail: error })
      )
    })

    expect(analytics.trackError).toHaveBeenCalledWith('toast_error', {
      error: expect.any(Error),
      toastId: 'error-test',
    })
  })
})
