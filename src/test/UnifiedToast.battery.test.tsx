import { render, act, fireEvent } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext, createTestCanvas } from './test-utils'

describe('UnifiedToast Battery Tests', () => {
  let canvas: HTMLCanvasElement
  let gl: WebGLRenderingContext
  let rafSpy: jest.SpyInstance
  let perfObserver: PerformanceObserver

  beforeEach(() => {
    canvas = createTestCanvas()
    gl = mockWebGLContext(canvas)
    rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(cb, 16))

    // Track performance metrics
    const metrics: PerformanceEntry[] = []
    perfObserver = new PerformanceObserver((list) => {
      metrics.push(...list.getEntries())
    })
    perfObserver.observe({ entryTypes: ['measure', 'longtask'] })
  })

  afterEach(() => {
    rafSpy.mockRestore()
    perfObserver.disconnect()
    canvas.remove()
  })

  describe('Animation Stability', () => {
    it('maintains smooth animations under heavy load', async () => {
      // Create 20 toasts with alternating effects
      const toasts = Array.from({ length: 20 }).map((_, i) => ({
        id: `toast-${i}`,
        title: `Toast ${i}`,
        effect: i % 2 ? 'glow' : 'ripple',
        variant: i % 3 ? 'destructive' : 'default',
      }))

      const { container } = render(
        <>
          {toasts.map((toast) => (
            <UnifiedToast key={toast.id} toast={toast} />
          ))}
        </>
      )

      await act(async () => {
        // Trigger animations on all toasts
        const alerts = container.querySelectorAll('[role="alert"]')
        for (const alert of alerts) {
          fireEvent.mouseEnter(alert)
          await new Promise((resolve) => setTimeout(resolve, 8)) // Rapid succession
        }

        // Let animations run
        await new Promise((resolve) => setTimeout(resolve, 500))
      })

      // Verify performance
      expect(gl.isContextLost()).toBe(false)
      expect(rafSpy).toHaveBeenCalled()
    })

    it('handles rapid interaction sequences', async () => {
      const { container } = render(
        <UnifiedToast
          toast={{
            id: 'test',
            title: 'Test Toast',
            effect: 'glow',
          }}
        />
      )

      const alert = container.querySelector('[role="alert"]')!

      await act(async () => {
        // Rapid mouse interactions
        fireEvent.mouseEnter(alert)
        fireEvent.mouseDown(alert)
        fireEvent.mouseMove(alert, { clientX: 50, clientY: 0 })
        fireEvent.mouseLeave(alert)
        fireEvent.mouseUp(alert)

        // Let animations process
        await new Promise((resolve) => setTimeout(resolve, 100))
      })

      expect(alert).toBeInTheDocument()
    })
  })

  describe('Resource Management', () => {
    it('cleans up WebGL resources properly', async () => {
      const { unmount } = render(
        <UnifiedToast
          toast={{
            id: 'cleanup-test',
            title: 'Cleanup Test',
            effect: 'ripple',
          }}
        />
      )

      // Track WebGL resources
      const initialPrograms = gl.getProgramParameter(
        gl.CURRENT_PROGRAM,
        gl.ACTIVE_ATTRIBUTES
      )

      unmount()

      // Verify cleanup
      expect(
        gl.getProgramParameter(gl.CURRENT_PROGRAM, gl.ACTIVE_ATTRIBUTES)
      ).toBeLessThanOrEqual(initialPrograms)
    })

    it('handles multiple context losses and recoveries', async () => {
      const { container } = render(
        <UnifiedToast
          toast={{
            id: 'context-test',
            title: 'Context Test',
          }}
        />
      )

      await act(async () => {
        // Multiple context loss/recovery cycles
        for (let i = 0; i < 5; i++) {
          canvas.dispatchEvent(new WebGLContextEvent('webglcontextlost'))
          await new Promise((resolve) => setTimeout(resolve, 16))
          canvas.dispatchEvent(new WebGLContextEvent('webglcontextrestored'))
          await new Promise((resolve) => setTimeout(resolve, 16))
        }
      })

      expect(container.querySelector('[role="alert"]')).toBeInTheDocument()
    })
  })

  describe('Visual Stability', () => {
    it('maintains visual consistency during rapid updates', async () => {
      const { container, rerender } = render(
        <UnifiedToast
          toast={{
            id: 'visual-test',
            title: 'Initial',
            variant: 'default',
          }}
        />
      )

      await act(async () => {
        // Rapid visual changes
        for (let i = 0; i < 10; i++) {
          rerender(
            <UnifiedToast
              toast={{
                id: 'visual-test',
                title: `Update ${i}`,
                variant: i % 2 ? 'destructive' : 'default',
                effect: i % 2 ? 'ripple' : 'glow',
              }}
            />
          )
          await new Promise((resolve) => setTimeout(resolve, 16))
        }
      })

      const alert = container.querySelector('[role="alert"]')
      expect(alert).toHaveStyle({
        opacity: '1',
        transform: expect.any(String),
      })
    })
  })
})
