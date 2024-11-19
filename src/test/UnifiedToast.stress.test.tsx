import { render, act, fireEvent } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext, createTestCanvas } from './test-utils'

describe('UnifiedToast Stress Tests', () => {
  let canvas: HTMLCanvasElement
  let gl: WebGLRenderingContext
  let rafSpy: jest.SpyInstance

  beforeEach(() => {
    canvas = createTestCanvas()
    gl = mockWebGLContext(canvas)
    rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(cb, 16))
  })

  afterEach(() => {
    rafSpy.mockRestore()
    canvas.remove()
  })

  it('handles multiple simultaneous toasts with animations', async () => {
    // Create array of 10 toasts with different effects
    const toasts = Array.from({ length: 10 }).map((_, i) => ({
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
      // Trigger hover animations on all toasts with slight delays
      const alerts = container.querySelectorAll('[role="alert"]')
      for (const alert of alerts) {
        fireEvent.mouseEnter(alert)
        await new Promise((resolve) => setTimeout(resolve, 16))
      }

      // Let animations run
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    // Verify GPU memory and performance
    expect(gl.isContextLost()).toBe(false)
    expect(rafSpy).toHaveBeenCalledTimes(expect.any(Number))
  })

  it('maintains performance during rapid mount/unmount cycles', async () => {
    const renderCount = 20
    const mountDuration = 32 // 2 frames
    let activeToasts = 0

    for (let i = 0; i < renderCount; i++) {
      const { unmount } = render(
        <UnifiedToast
          toast={{
            id: `toast-${i}`,
            title: 'Stress Test',
            effect: 'glow',
          }}
        />
      )

      activeToasts++

      // Unmount after brief delay
      setTimeout(() => {
        unmount()
        activeToasts--
      }, mountDuration)

      await new Promise((resolve) => setTimeout(resolve, 16))
    }

    // Verify cleanup
    expect(activeToasts).toBe(0)
    expect(gl.getParameter(gl.CURRENT_PROGRAM)).not.toBeNull()
  })

  it('recovers from rapid prop updates during animations', async () => {
    const { container, rerender } = render(
      <UnifiedToast
        toast={{
          id: 'stress-test',
          title: 'Initial',
          variant: 'default',
          effect: 'glow',
        }}
      />
    )

    await act(async () => {
      const alert = container.querySelector('[role="alert"]')!

      // Start animation
      fireEvent.mouseEnter(alert)

      // Rapid prop changes during animation
      for (let i = 0; i < 15; i++) {
        rerender(
          <UnifiedToast
            toast={{
              id: 'stress-test',
              title: `Update ${i}`,
              variant: i % 2 ? 'destructive' : 'default',
              effect: i % 2 ? 'ripple' : 'glow',
            }}
          />
        )
        await new Promise((resolve) => setTimeout(resolve, 16))
      }

      // Let animations settle
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    // Verify stable end state
    const alert = container.querySelector('[role="alert"]')
    expect(alert).toHaveStyle({
      opacity: '1',
      transform: expect.any(String),
    })
    expect(gl.isContextLost()).toBe(false)
  })
})
