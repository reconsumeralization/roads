import { render, act, fireEvent } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext, createTestCanvas } from './test-utils'

describe('UnifiedToast Performance Benchmarks', () => {
  let canvas: HTMLCanvasElement
  let gl: WebGLRenderingContext
  let perfObserver: PerformanceObserver
  let frameMetrics: { timestamp: number; duration: number }[] = []

  beforeEach(() => {
    canvas = createTestCanvas()
    gl = mockWebGLContext(canvas)
    frameMetrics = []

    // Track frame timing
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      const now = performance.now()
      frameMetrics.push({
        timestamp: now,
        duration: frameMetrics.length
          ? now - frameMetrics[frameMetrics.length - 1].timestamp
          : 0,
      })
      return setTimeout(() => cb(now), 16)
    })

    // Track long tasks
    perfObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.duration > 50) {
          // Tasks longer than 50ms
          console.warn(`Long task detected: ${entry.duration}ms`)
        }
      })
    })
    perfObserver.observe({ entryTypes: ['longtask'] })
  })

  afterEach(() => {
    jest.clearAllMocks()
    perfObserver.disconnect()
    canvas.remove()
  })

  it('maintains 60fps during effect transitions', async () => {
    const { container, rerender } = render(
      <UnifiedToast
        toast={{
          id: 'perf-test',
          title: 'Performance Test',
          effect: 'glow',
        }}
      />
    )

    await act(async () => {
      // Rapid effect changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <UnifiedToast
            toast={{
              id: 'perf-test',
              title: 'Performance Test',
              effect: i % 2 ? 'ripple' : 'glow',
            }}
          />
        )
        await new Promise((resolve) => setTimeout(resolve, 32))
      }
    })

    // Analyze frame timing
    const avgFrameTime =
      frameMetrics.reduce((sum, m) => sum + m.duration, 0) / frameMetrics.length
    const maxFrameTime = Math.max(...frameMetrics.map((m) => m.duration))

    expect(avgFrameTime).toBeLessThan(16.7) // Target 60fps (16.7ms per frame)
    expect(maxFrameTime).toBeLessThan(33.3) // No single frame > 2x target frame time
  })

  it('efficiently handles multiple concurrent animations', async () => {
    const startHeap = performance.memory?.usedJSHeapSize || 0

    // Render multiple toasts
    const { container } = render(
      <>
        {Array.from({ length: 10 }).map((_, i) => (
          <UnifiedToast
            key={i}
            toast={{
              id: `toast-${i}`,
              title: `Toast ${i}`,
              effect: i % 2 ? 'glow' : 'ripple',
            }}
          />
        ))}
      </>
    )

    await act(async () => {
      // Trigger animations on all toasts
      container.querySelectorAll('[role="alert"]').forEach((alert) => {
        fireEvent.mouseEnter(alert)
      })

      // Let animations run
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    const endHeap = performance.memory?.usedJSHeapSize || 0
    const heapGrowth = endHeap - startHeap

    expect(heapGrowth).toBeLessThan(5 * 1024 * 1024) // Less than 5MB growth
    expect(gl.getParameter(gl.GPU_DISJOINT_EXT)).toBe(false)
  })
})
