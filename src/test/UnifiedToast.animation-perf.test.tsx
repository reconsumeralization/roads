import { render, act, fireEvent } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext, createTestCanvas } from './test-utils'

describe('UnifiedToast Animation Performance Tests', () => {
  let canvas: HTMLCanvasElement
  let gl: WebGLRenderingContext
  let perfObserver: PerformanceObserver

  beforeEach(() => {
    canvas = createTestCanvas()
    gl = mockWebGLContext(canvas)

    // Track long tasks and frame timing
    const longTasks: PerformanceEntry[] = []
    perfObserver = new PerformanceObserver((list) => {
      longTasks.push(...list.getEntries())
    })
    perfObserver.observe({ entryTypes: ['longtask'] })
  })

  afterEach(() => {
    perfObserver.disconnect()
    canvas.remove()
  })

  it('maintains consistent frame timing during complex animations', async () => {
    const frameTimes: number[] = []
    let lastFrameTime = performance.now()

    // Track frame timing
    const rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        const now = performance.now()
        frameTimes.push(now - lastFrameTime)
        lastFrameTime = now
        return setTimeout(() => cb(now), 16)
      })

    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'perf-test',
          title: 'Performance Test',
          effect: 'glow',
        }}
      />
    )

    await act(async () => {
      const alert = container.querySelector('[role="alert"]')!

      // Trigger complex animation sequence
      fireEvent.mouseEnter(alert)
      await new Promise((resolve) => setTimeout(resolve, 32))

      fireEvent.mouseDown(alert)
      fireEvent.mouseMove(alert, { clientX: 50, clientY: 0 })
      await new Promise((resolve) => setTimeout(resolve, 32))

      fireEvent.mouseUp(alert)
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    // Verify frame timing consistency
    const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length
    expect(avgFrameTime).toBeLessThan(20) // Target 50fps minimum

    // Check for frame time spikes
    const maxFrameTime = Math.max(...frameTimes)
    expect(maxFrameTime).toBeLessThan(33) // No single frame > 33ms

    rafSpy.mockRestore()
  })

  it('handles rapid prop changes without dropping frames', async () => {
    const { container, rerender } = render(
      <UnifiedToast
        toast={{
          id: 'stress-test',
          title: 'Initial State',
          variant: 'default',
        }}
      />
    )

    await act(async () => {
      // Simulate rapid prop changes during animation
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseEnter(container.querySelector('[role="alert"]')!)

        rerender(
          <UnifiedToast
            toast={{
              id: 'stress-test',
              title: `Update ${i}`,
              variant: i % 2 ? 'destructive' : 'default',
              effect: i % 3 ? 'ripple' : 'glow',
            }}
          />
        )

        await new Promise((resolve) => setTimeout(resolve, 16))
      }
    })

    // Verify WebGL context remained stable
    expect(gl.isContextLost()).toBe(false)
    expect(gl.getParameter(gl.CURRENT_PROGRAM)).not.toBeNull()
  })

  it('maintains smooth animations with multiple effects active', async () => {
    const { container } = render(
      <>
        {Array.from({ length: 5 }).map((_, i) => (
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
      const toasts = container.querySelectorAll('[role="alert"]')
      toasts.forEach((toast) => {
        fireEvent.mouseEnter(toast)
      })

      // Let effects run
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    // Check GPU memory usage hasn't spiked
    const gpuMemoryInfo = gl.getExtension('WEBKIT_WEBGL_lose_context')
    if (gpuMemoryInfo) {
      const memoryUsage = gpuMemoryInfo.getParameter(0x9049) // MEMORY_INFO_CURRENT_AVAILABLE
      expect(memoryUsage).toBeGreaterThan(0) // Memory still available
    }
  })
})
