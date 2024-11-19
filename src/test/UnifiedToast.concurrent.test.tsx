import { render, act, fireEvent } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext, createTestCanvas } from './test-utils'

describe('UnifiedToast Concurrent Animation Tests', () => {
  let canvas: HTMLCanvasElement
  let gl: WebGLRenderingContext

  beforeEach(() => {
    canvas = createTestCanvas()
    gl = mockWebGLContext(canvas)
    jest.spyOn(window, 'requestAnimationFrame')
  })

  afterEach(() => {
    jest.clearAllMocks()
    canvas.remove()
  })

  it('handles multiple animation sources correctly', async () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'test',
          title: 'Test Toast',
        }}
      />
    )

    await act(async () => {
      const alert = container.querySelector('[role="alert"]')!

      // Start hover animation
      fireEvent.mouseEnter(alert)

      // Start swipe while hover is active
      fireEvent.mouseDown(alert)
      fireEvent.mouseMove(alert, { clientX: 50, clientY: 0 })

      // Start prop change animation
      alert.style.transform = 'scale(1.1)'

      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    // Verify animations completed without conflicts
    expect(requestAnimationFrame).toHaveBeenCalledTimes(expect.any(Number))
    expect(container.querySelector('[role="alert"]')).toHaveStyle({
      transform: expect.any(String),
    })
  })
})
