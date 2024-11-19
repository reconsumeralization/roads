import { env } from '@/env.mjs'
import { AppError } from '@/utils/errors'

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

type LogFormatter = (entry: LogEntry) => string

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  component?: string
  digest?: string
  error?: unknown
  context?: Record<string, unknown>
  environment: string
}

export class Logger {
  private static instance: Logger
  private logLevel: LogLevel
  private formatter: LogFormatter

  constructor() {
    this.logLevel = (env.LOG_LEVEL as LogLevel) || LogLevel.INFO
    this.formatter =
      env.NODE_ENV === 'development'
        ? this.developmentFormatter
        : this.productionFormatter
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private developmentFormatter: LogFormatter = (entry) => {
    const { timestamp, level, message, component, error, context } = entry
    return JSON.stringify(
      {
        timestamp,
        level: level.toUpperCase(),
        component,
        message,
        ...(error && { error: this.formatError(error) }),
        ...(context && { context }),
      },
      null,
      2
    )
  }

  private productionFormatter: LogFormatter = (entry) => {
    // Production format is more concise and structured for log aggregation
    return JSON.stringify({
      ts: entry.timestamp,
      lvl: entry.level,
      msg: entry.message,
      cmp: entry.component,
      dig: entry.digest,
      err: entry.error ? this.formatError(entry.error) : undefined,
      ctx: entry.context,
      env: entry.environment,
    })
  }

  private formatError(error: unknown): object {
    if (error instanceof AppError) {
      return error.toJSON()
    }
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: env.NODE_ENV !== 'production' ? error.stack : undefined,
      }
    }
    return { unknown: String(error) }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel)
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }

  private log(
    level: LogLevel,
    message: string,
    context: Record<string, unknown> = {}
  ) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
      environment: env.NODE_ENV,
    }

    const formattedLog = this.formatter(entry)

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog)
        break
      case LogLevel.WARN:
        console.warn(formattedLog)
        break
      case LogLevel.INFO:
        console.info(formattedLog)
        break
      case LogLevel.DEBUG:
        console.debug(formattedLog)
        break
    }
  }

  debug(message: string, context: Record<string, unknown> = {}) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context: Record<string, unknown> = {}) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context: Record<string, unknown> = {}) {
    this.log(LogLevel.WARN, message, context)
  }

  error(
    message: string,
    {
      error,
      context = {},
      digest,
      component,
    }: {
      error?: Error | AppError
      context?: Record<string, unknown>
      digest?: string
      component?: string
    } = {}
  ) {
    this.log(LogLevel.ERROR, message, {
      error,
      context,
      digest,
      component,
    })
  }
}

export const logger = Logger.getInstance()
