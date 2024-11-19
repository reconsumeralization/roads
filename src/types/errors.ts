export class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' = 'medium',
    public userMessage?: string
  ) {
    super(message)
    this.name = 'BusinessError'
  }
}

export class ValidationError extends BusinessError {
  constructor(message: string, field?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      'low',
      field ? `Please check the ${field} field` : message
    )
    this.name = 'ValidationError'
  }
}

export class DatabaseError extends BusinessError {
  constructor(message: string) {
    super(
      message,
      'DATABASE_ERROR',
      'high',
      'A system error occurred. Please try again later.'
    )
    this.name = 'DatabaseError'
  }
}

export class ToastError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.name = 'ToastError'
    this.code = code
  }
}

export class ShaderError extends ToastError {
  constructor(message: string) {
    super(message, 'SHADER')
  }
}

export class WebGLError extends ToastError {
  constructor(message: string) {
    super(message, 'WEBGL')
  }
}

export class GestureError extends ToastError {
  constructor(message: string) {
    super(message, 'GESTURE')
  }
}

export type ErrorMetadata = {
  timestamp: number
  browser: string
  device: string
  error: Error
  componentStack?: string
}

export interface ErrorTracker {
  captureError: (error: Error, metadata?: Partial<ErrorMetadata>) => void
  getErrorCount: () => number
  clearErrors: () => void
}
