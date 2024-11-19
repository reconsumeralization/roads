import { act, renderHook } from '@testing-library/react'
import { useToast } from '@/hooks/useToast'
import { vi } from 'vitest'
import { ToastError, ShaderError, WebGLError } from '@/types/errors'

export const createTestToast = async (props: Partial<ToasterToast> = {}) => {
  const { result } = renderHook(() => useToast())

  await act(async () => {
    result.current.toast({
      title: 'Test Toast',
      duration: 2000,
      ...props,
    })
  })

  return result
}

export const simulateGestureError = async (toastRef: React.RefObject<any>) => {
  if (!toastRef.current) throw new Error('Toast ref not found')

  await act(async () => {
    const error = new ToastError('Gesture failed', 'GESTURE', 'MEDIUM')
    toastRef.current.handleGestureError(error)
  })
}

export const mockWebGLContext = () => {
  const context = {
    isContextLost: vi.fn().mockReturnValue(false),
    getExtension: vi.fn(),
    getParameter: vi.fn(),
    getShaderPrecisionFormat: vi.fn(() => ({
      precision: 23,
      rangeMin: 127,
      rangeMax: 127,
    })),
  }

  return {
    context,
    simulateContextLoss: () => {
      context.isContextLost.mockReturnValue(true)
      const event = new Event('webglcontextlost')
      document.dispatchEvent(event)
    },
    simulateContextRestore: () => {
      context.isContextLost.mockReturnValue(false)
      const event = new Event('webglcontextrestored')
      document.dispatchEvent(event)
    },
  }
}

export const createMockErrorTracker = (): ErrorTracker => {
  const errors: Error[] = []

  return {
    captureError: (error: Error) => {
      errors.push(error)
    },
    getErrorCount: () => errors.length,
    clearErrors: () => (errors.length = 0),
  }
}
