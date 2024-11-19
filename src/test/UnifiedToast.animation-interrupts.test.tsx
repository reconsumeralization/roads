import { render, act, fireEvent } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext, createTestCanvas } from './test-utils'

describe('UnifiedToast Animation Interruption Tests', () => {
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

  it('handles natural context loss during animation', async () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'test',
          title: 'Test Toast',
          variant: 'default',
        }}
      />
    )

    await act(async () => {
      // Start animation
      fireEvent.mouseEnter(container.querySelector('[role="alert"]')!)

      // Simulate natural context loss mid-animation
      const contextLost = new WebGLContextEvent('webglcontextlost')
      canvas.dispatchEvent(contextLost)

      // Verify component handles loss gracefully
      expect(gl.isContextLost()).toBe(true)

      // Simulate context restore
      const contextRestored = new WebGLContextEvent('webglcontextrestored')
      canvas.dispatchEvent(contextRestored)

      // Let animation resume
      await new Promise((resolve) => setTimeout(resolve, 32))
    })

    // Verify animation recovered
    expect(container.querySelector('[role="alert"]')).toBeInTheDocument()
    expect(gl.isContextLost()).toBe(false)
  })

  it('maintains animation state through prop changes', async () => {
    const { container, rerender } = render(
      <UnifiedToast
        toast={{
          id: 'test',
          title: 'Initial',
          variant: 'default',
        }}
      />
    )

    await act(async () => {
      // Start hover animation
      fireEvent.mouseEnter(container.querySelector('[role="alert"]')!)

      // Change props mid-animation
      rerender(
        <UnifiedToast
          toast={{
            id: 'test',
            title: 'Updated',
            variant: 'destructive',
          }}
        />
      )

      // Let animation adjust
      await new Promise((resolve) => setTimeout(resolve, 32))
    })

    // Verify animation adapted to new props
    const alert = container.querySelector('[role="alert"]')
    expect(alert).toHaveTextContent('Updated')
    expect(alert).toHaveClass('destructive')
  })

  it('recovers from rapid animation interruptions', async () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'test',
          title: 'Test Toast',
        }}
      />
    )

    await act(async () => {
      // Trigger multiple overlapping animations
      fireEvent.mouseEnter(container.querySelector('[role="alert"]')!)
      await new Promise((resolve) => setTimeout(resolve, 8))

      fireEvent.mouseLeave(container.querySelector('[role="alert"]')!)
      await new Promise((resolve) => setTimeout(resolve, 8))

      fireEvent.mouseEnter(container.querySelector('[role="alert"]')!)

      // Let animations settle
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    // Verify final state is stable
    expect(container.querySelector('[role="alert"]')).toHaveStyle({
      opacity: '1',
      transform: expect.any(String),
    })
  })
})
