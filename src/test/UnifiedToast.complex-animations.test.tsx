import { render, act, fireEvent } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext, createTestCanvas } from './test-utils'

describe('UnifiedToast Complex Animation Tests', () => {
  let canvas: HTMLCanvasElement
  let gl: WebGLRenderingContext

  beforeEach(() => {
    canvas = createTestCanvas()
    gl = mockWebGLContext(canvas)
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(cb, 16))
  })

  afterEach(() => {
    jest.clearAllMocks()
    canvas.remove()
  })

  it('handles chained animations smoothly', async () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'test',
          title: 'Test Toast',
        }}
      />
    )

    await act(async () => {
      // Start hover animation
      fireEvent.mouseEnter(container.querySelector('[role="alert"]')!)
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Start swipe while hover is active
      fireEvent.mouseDown(container.querySelector('[role="alert"]')!)
      fireEvent.mouseMove(container.querySelector('[role="alert"]')!, {
        clientX: 100,
        clientY: 0,
      })
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Release swipe
      fireEvent.mouseUp(container.querySelector('[role="alert"]')!)
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    expect(container.querySelector('[role="alert"]')).toHaveStyle({
      transform: expect.stringContaining('translate3d(0px, 0px, 0px)'),
    })
  })

  it('handles concurrent animations on multiple toasts', async () => {
    const { container } = render(
      <>
        <UnifiedToast
          toast={{
            id: 'toast1',
            title: 'Toast 1',
          }}
        />
        <UnifiedToast
          toast={{
            id: 'toast2',
            title: 'Toast 2',
          }}
        />
      </>
    )

    await act(async () => {
      // Animate both toasts simultaneously
      const toasts = container.querySelectorAll('[role="alert"]')
      fireEvent.mouseEnter(toasts[0])
      fireEvent.mouseEnter(toasts[1])

      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    const toasts = container.querySelectorAll('[role="alert"]')
    expect(toasts[0]).toHaveStyle({ opacity: '1' })
    expect(toasts[1]).toHaveStyle({ opacity: '1' })
  })

  it('handles animation interruption during WebGL state changes', async () => {
    const { container, rerender } = render(
      <UnifiedToast
        toast={{
          id: 'test',
          title: 'Initial',
          effect: 'glow',
        }}
      />
    )

    await act(async () => {
      // Start effect animation
      fireEvent.mouseEnter(container.querySelector('[role="alert"]')!)

      // Change WebGL effect mid-animation
      rerender(
        <UnifiedToast
          toast={{
            id: 'test',
            title: 'Updated',
            effect: 'ripple',
          }}
        />
      )

      // Verify WebGL resources are managed correctly
      expect(gl.getParameter(gl.CURRENT_PROGRAM)).not.toBeNull()

      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    // Verify final visual state
    const alert = container.querySelector('[role="alert"]')
    expect(alert).toHaveAttribute('data-effect', 'ripple')
  })
})
