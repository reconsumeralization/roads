import { render, act, fireEvent } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext } from './toast-test-utils'
import { ToastErrorCode } from '@/types/toast-errors'
import { ToastError } from '@/types/errors'

describe('UnifiedToast Error Handling', () => {
  const mockToast = {
    id: 'test-toast',
    title: 'Test Toast',
    variant: 'default' as const,
    duration: 2000,
  }

  // Mock error reporting
  const mockReportError = jest.fn()
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    mockReportError.mockClear()
    consoleError.mockClear()
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  it('handles WebGL context loss and recovery', async () => {
    const { context, simulateContextLoss, simulateContextRestore } =
      mockWebGLContext()
    const onDismiss = jest.fn()

    const { container } = render(
      <UnifiedToast toast={mockToast} onDismiss={onDismiss} />
    )

    // Simulate context loss
    await act(async () => {
      simulateContextLoss()
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    // Verify error handling
    expect(mockReportError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ToastErrorCode.WEBGL_CONTEXT_LOST,
      })
    )

    // Simulate context restore
    await act(async () => {
      simulateContextRestore()
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    // Verify recovery
    expect(container.querySelector('canvas')).toBeInTheDocument()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('handles shader compilation errors', async () => {
    const { context } = mockWebGLContext()
    const gl = context as WebGLRenderingContext
    const onDismiss = jest.fn()

    const { container } = render(
      <UnifiedToast toast={mockToast} onDismiss={onDismiss} />
    )

    // Simulate shader compilation error
    await act(async () => {
      const error = new ToastError(
        'Shader compilation failed',
        ToastErrorCode.SHADER_COMPILATION
      )
      container
        .querySelector('canvas')
        ?.dispatchEvent(new CustomEvent('webglcontexterror', { detail: error }))
    })

    // Verify error handling and fallback
    expect(mockReportError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ToastErrorCode.SHADER_COMPILATION,
      })
    )
    expect(gl.getParameter(gl.CURRENT_PROGRAM)).toBe(null)
  })

  it('handles animation failures with retry', async () => {
    const onDismiss = jest.fn()
    let retryCount = 0

    const { container } = render(
      <UnifiedToast toast={mockToast} onDismiss={onDismiss} />
    )

    // Simulate multiple animation failures
    await act(async () => {
      for (let i = 0; i < 3; i++) {
        const error = new ToastError(
          'Animation failed',
          ToastErrorCode.ANIMATION_FAILURE
        )
        container
          .querySelector('[role="alert"]')
          ?.dispatchEvent(new CustomEvent('animationerror', { detail: error }))
        retryCount++
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    })

    // Verify retry attempts and eventual fallback
    expect(retryCount).toBe(3)
    expect(onDismiss).toHaveBeenCalled()
  })

  it('handles gesture interaction errors', async () => {
    const onDismiss = jest.fn()

    const { container } = render(
      <UnifiedToast toast={mockToast} onDismiss={onDismiss} />
    )

    // Simulate gesture error
    await act(async () => {
      const error = new ToastError(
        'Gesture failed',
        ToastErrorCode.GESTURE_FAILURE
      )
      fireEvent.mouseDown(container.querySelector('[role="alert"]')!)
      container
        .querySelector('[role="alert"]')
        ?.dispatchEvent(new CustomEvent('gestureerror', { detail: error }))
    })

    // Verify error handling
    expect(mockReportError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ToastErrorCode.GESTURE_FAILURE,
      })
    )
  })

  it('handles concurrent error scenarios', async () => {
    const { context } = mockWebGLContext()
    const onDismiss = jest.fn()
    const errors: ToastError[] = []

    const { container } = render(
      <UnifiedToast toast={mockToast} onDismiss={onDismiss} />
    )

    // Simulate multiple concurrent errors
    await act(async () => {
      // WebGL error
      const webglError = new ToastError(
        'WebGL error',
        ToastErrorCode.WEBGL_CONTEXT_LOST
      )
      container
        .querySelector('canvas')
        ?.dispatchEvent(
          new CustomEvent('webglcontexterror', { detail: webglError })
        )
      errors.push(webglError)

      // Animation error
      const animationError = new ToastError(
        'Animation failed',
        ToastErrorCode.ANIMATION_FAILURE
      )
      container
        .querySelector('[role="alert"]')
        ?.dispatchEvent(
          new CustomEvent('animationerror', { detail: animationError })
        )
      errors.push(animationError)

      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    // Verify all errors were handled
    errors.forEach((error) => {
      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: error.code,
        })
      )
    })
  })

  it('handles memory-related errors', async () => {
    const onDismiss = jest.fn()
    const initialMemory = performance.memory?.usedJSHeapSize

    // Create multiple toasts to stress memory
    const toasts = Array.from({ length: 50 }, (_, i) => ({
      ...mockToast,
      id: `stress-${i}`,
    }))

    await act(async () => {
      toasts.forEach((toast) => {
        render(<UnifiedToast toast={toast} onDismiss={onDismiss} />)
      })
    })

    const finalMemory = performance.memory?.usedJSHeapSize
    const memoryGrowth = finalMemory - initialMemory

    // Verify memory usage and error handling
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024) // 50MB threshold
    expect(mockReportError).not.toHaveBeenCalled()
  })

  it('handles cleanup errors gracefully', async () => {
    const { context } = mockWebGLContext()
    const gl = context as WebGLRenderingContext
    const onDismiss = jest.fn()

    const { unmount } = render(
      <UnifiedToast toast={mockToast} onDismiss={onDismiss} />
    )

    // Track resources before unmount
    const resourcesBefore = {
      textures: gl.getParameter(gl.TEXTURE_BINDING_2D),
      buffers: gl.getParameter(gl.ARRAY_BUFFER_BINDING),
      programs: gl.getParameter(gl.CURRENT_PROGRAM),
    }

    // Simulate cleanup error
    await act(async () => {
      const error = new ToastError(
        'Cleanup failed',
        ToastErrorCode.CLEANUP_FAILURE
      )
      unmount()
      gl.canvas.dispatchEvent(
        new CustomEvent('cleanuperror', { detail: error })
      )
    })

    // Verify resources were cleaned up despite error
    const resourcesAfter = {
      textures: gl.getParameter(gl.TEXTURE_BINDING_2D),
      buffers: gl.getParameter(gl.ARRAY_BUFFER_BINDING),
      programs: gl.getParameter(gl.CURRENT_PROGRAM),
    }

    expect(resourcesAfter).toEqual(resourcesBefore)
    expect(mockReportError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ToastErrorCode.CLEANUP_FAILURE,
      })
    )
  })
})
