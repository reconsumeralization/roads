import { BusinessError } from '@/types/errors'

interface ErrorResponse {
  message: string
  code?: string
  field?: string
  severity?: string
}

export function handleError(error: unknown): ErrorResponse {
  // Known business errors
  if (error instanceof BusinessError) {
    return {
      message: error.userMessage || error.message,
      code: error.code,
      severity: error.severity,
    }
  }

  // Database errors
  if (error instanceof Error && error.message.includes('database')) {
    return {
      message: 'A system error occurred. Please try again later.',
      code: 'DATABASE_ERROR',
      severity: 'high',
    }
  }

  // Network errors
  if (error instanceof Error && error.message.includes('network')) {
    return {
      message: 'Please check your internet connection and try again.',
      code: 'NETWORK_ERROR',
      severity: 'medium',
    }
  }

  // Default error
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    severity: 'medium',
  }
}

export function logError(error: unknown, context?: Record<string, any>) {
  console.error('Error occurred:', {
    error,
    context,
    timestamp: new Date().toISOString(),
    // Add any other relevant debugging information
  })

  // Here you could also send to error monitoring service
  // if (process.env.NODE_ENV === 'production') {
  //   errorMonitoringService.capture(error, context)
  // }
}
