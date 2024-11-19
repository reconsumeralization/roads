export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }

  static BadRequest(message: string, context?: Record<string, unknown>) {
    return new AppError(message, 'BAD_REQUEST', 400, context)
  }

  static Unauthorized(message: string, context?: Record<string, unknown>) {
    return new AppError(message, 'UNAUTHORIZED', 401, context)
  }

  static NotFound(message: string, context?: Record<string, unknown>) {
    return new AppError(message, 'NOT_FOUND', 404, context)
  }

  static ServerError(message: string, context?: Record<string, unknown>) {
    return new AppError(message, 'SERVER_ERROR', 500, context)
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: this.stack,
        context: this.context
      })
    }
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      { originalError: error.name }
    )
  }

  return new AppError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    { originalError: error }
  )
} 
