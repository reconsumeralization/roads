type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogConfig {
  level: LogLevel
  enableStackTrace: boolean
  environment: string
  sentryDsn?: string
}

// Default config based on environment variables
const config: LogConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || 'error',
  enableStackTrace: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV || 'development',
  sentryDsn: process.env.SENTRY_DSN
}

export function logError(error: Error, errorInfo?: React.ErrorInfo) {
  // Always log in development
  if (config.environment === 'development') {
    console.error('Error:', error)
    if (errorInfo?.componentStack) {
      console.error('Component Stack:', errorInfo.componentStack)
    }
    return
  }

  // In production, respect log level
  if (config.level === 'error') {
    // Basic error logging
    console.error({
      name: error.name,
      message: error.message,
      ...(config.enableStackTrace && { stack: error.stack }),
      timestamp: new Date().toISOString(),
      environment: config.environment
    })

    // If Sentry is configured, send error
    if (config.sentryDsn) {
      // Implement Sentry logging here
    }
  }
}

export function logInfo(message: string, data?: unknown) {
  if (['debug', 'info'].includes(config.level)) {
    console.log({
      level: 'info',
      message,
      data,
      timestamp: new Date().toISOString(),
      environment: config.environment
    })
  }
}

export function logDebug(message: string, data?: unknown) {
  if (config.level === 'debug') {
    console.debug({
      level: 'debug',
      message,
      data,
      timestamp: new Date().toISOString(),
      environment: config.environment
    })
  }
}
