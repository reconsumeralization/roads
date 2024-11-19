import { ErrorMetadata, ToastError } from '@/types/errors'
import { ToastErrorCode } from '@/types/toast-errors'
import { ToastPerformanceMonitor } from './performance-monitoring'
import { AnalyticsService } from './analytics'

type RecoveryStrategy = {
  recover: () => void | Promise<void>
  fallback?: () => void
  retryCount: number
  maxRetries: number
  retryDelay?: number // Delay between retries in ms
  shouldRetry?: (error: Error) => boolean // Custom retry condition
}

export class ToastErrorRecovery {
  private strategies: Map<string, RecoveryStrategy> = new Map()
  private errorLog: ErrorMetadata[] = []
  private performanceMonitor: ToastPerformanceMonitor
  private analytics: AnalyticsService

  constructor(
    private readonly reportError: (error: Error) => void,
    onPerformanceIssue?: (metric: any) => void,
    analyticsConfig?: { endpoint: string; apiKey: string }
  ) {
    this.performanceMonitor = new ToastPerformanceMonitor((metric) => {
      onPerformanceIssue?.(metric)
      this.analytics?.trackPerformance(metric)
    })

    if (analyticsConfig) {
      this.analytics = new AnalyticsService(
        analyticsConfig.endpoint,
        analyticsConfig.apiKey
      )
    }
  }

  addStrategy(code: ToastErrorCode, strategy: RecoveryStrategy) {
    this.strategies.set(code, {
      maxRetries: 3,
      retryCount: 0,
      retryDelay: 1000,
      shouldRetry: () => true,
      ...strategy,
    })
  }

  async handleError(error: ToastError, context?: any) {
    this.analytics?.trackError(error, {
      context,
      recoveryAttempt: this.strategies.get(error.code)?.retryCount,
    })

    const strategy = this.strategies.get(error.code)
    const metadata: ErrorMetadata = {
      timestamp: Date.now(),
      browser: navigator.userAgent,
      device: `${window.innerWidth}x${window.innerHeight}`,
      error,
      context,
    }

    this.errorLog.push(metadata)
    this.reportError(error)

    if (!strategy) {
      console.warn(`No recovery strategy for error code: ${error.code}`)
      return
    }

    if (
      strategy.retryCount < strategy.maxRetries &&
      strategy.shouldRetry(error)
    ) {
      strategy.retryCount++

      if (strategy.retryDelay) {
        await new Promise((resolve) => setTimeout(resolve, strategy.retryDelay))
      }

      try {
        await this.performanceMonitor.measureAsync(
          'recovery',
          async () => {
            await Promise.resolve(strategy.recover())
          },
          { error, retryCount: strategy.retryCount }
        )
      } catch (recoveryError) {
        if (strategy.fallback) {
          strategy.fallback()
        }
      }
    } else {
      if (strategy.fallback) {
        strategy.fallback()
      }
    }
  }

  resetRetryCount(code: ToastErrorCode) {
    const strategy = this.strategies.get(code)
    if (strategy) {
      strategy.retryCount = 0
    }
  }

  getErrorLog() {
    return this.errorLog
  }

  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics()
  }

  clearMetrics() {
    this.performanceMonitor.clearMetrics()
  }

  addCommonStrategies() {
    this.addStrategy(ToastErrorCode.WEBGL_CONTEXT_LOST, {
      recover: async () => {
        const canvas = document.querySelector('canvas')
        if (canvas) {
          const gl = canvas.getContext('webgl2')
          await new Promise((resolve) => setTimeout(resolve, 1000))
          gl?.getExtension('WEBGL_lose_context')?.restoreContext()
        }
      },
      maxRetries: 2,
      retryDelay: 1000,
      shouldRetry: (error) => !error.message.includes('permanent'),
    })

    this.addStrategy(ToastErrorCode.SHADER_COMPILATION, {
      recover: async () => {
        await this.performanceMonitor.measureAsync('recovery', async () => {
          const material = this.context?.material
          if (material) {
            material.precision = 'lowp'
            material.needsUpdate = true
          }
        })
      },
      maxRetries: 1,
    })

    this.addStrategy(ToastErrorCode.ANIMATION_FAILURE, {
      recover: () => {
        const group = this.context?.group
        if (group) {
          group.position.set(0, 0, 0)
          group.rotation.set(0, 0, 0)
          group.scale.set(1, 1, 1)
        }
      },
      maxRetries: 3,
      retryDelay: 500,
    })
  }
}
