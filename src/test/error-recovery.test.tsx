import { render, act } from '@testing-library/react'
import { ToastErrorRecovery } from '@/utils/error-recovery'
import { ToastError } from '@/types/errors'
import { ToastErrorCode } from '@/types/toast-errors'
import { UnifiedToast } from '@/components/UnifiedToast'
import { mockWebGLContext } from './toast-test-utils'

describe('Toast Error Recovery', () => {
  let errorRecovery: ToastErrorRecovery
  const mockReportError = jest.fn()

  beforeEach(() => {
    errorRecovery = new ToastErrorRecovery(mockReportError)
    mockReportError.mockClear()
  })

  it('handles animation failures with retry', async () => {
    const mockRecover = jest.fn()
    const mockFallback = jest.fn()

    errorRecovery.addStrategy(ToastErrorCode.ANIMATION_FAILURE, {
      recover: mockRecover,
      fallback: mockFallback,
      retryCount: 0,
      maxRetries: 2,
    })

    const error = new ToastError(
      'Animation failed',
      ToastErrorCode.ANIMATION_FAILURE
    )

    await act(async () => {
      await errorRecovery.handleError(error)
    })

    expect(mockRecover).toHaveBeenCalled()
    expect(mockFallback).not.toHaveBeenCalled()
    expect(mockReportError).toHaveBeenCalledWith(error)
  })

  it('falls back after max retries', async () => {
    const mockRecover = jest
      .fn()
      .mockRejectedValue(new Error('Recovery failed'))
    const mockFallback = jest.fn()

    errorRecovery.addStrategy(ToastErrorCode.ANIMATION_FAILURE, {
      recover: mockRecover,
      fallback: mockFallback,
      retryCount: 0,
      maxRetries: 2,
    })

    const error = new ToastError(
      'Animation failed',
      ToastErrorCode.ANIMATION_FAILURE
    )

    for (let i = 0; i <= 2; i++) {
      await act(async () => {
        await errorRecovery.handleError(error)
      })
    }

    expect(mockRecover).toHaveBeenCalledTimes(3)
    expect(mockFallback).toHaveBeenCalled()
  })

  it('recovers from WebGL context loss', async () => {
    const { context, simulateContextLoss, simulateContextRestore } =
      mockWebGLContext()
    const onDismiss = jest.fn()

    const { container } = render(
      <UnifiedToast
        toast={{
          id: '1',
          title: 'Test Toast',
          variant: 'default',
        }}
        onDismiss={onDismiss}
      />
    )

    errorRecovery.addStrategy(ToastErrorCode.WEBGL_CONTEXT_LOST, {
      recover: () => simulateContextRestore(),
      fallback: onDismiss,
      retryCount: 0,
      maxRetries: 1,
    })

    await act(async () => {
      simulateContextLoss()
    })

    expect(context.isContextLost).toHaveBeenCalled()
    expect(mockReportError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ToastErrorCode.WEBGL_CONTEXT_LOST,
      })
    )
  })

  it('logs errors with metadata', async () => {
    const error = new ToastError(
      'Test error',
      ToastErrorCode.SHADER_COMPILATION
    )

    await act(async () => {
      await errorRecovery.handleError(error, { componentId: 'test' })
    })

    const errorLog = errorRecovery.getErrorLog()
    expect(errorLog[0]).toMatchObject({
      error,
      context: { componentId: 'test' },
      browser: expect.any(String),
      device: expect.any(String),
      timestamp: expect.any(Number),
    })
  })
})
