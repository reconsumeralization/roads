import { Logger, LogLevel } from './logger'
import { env } from '@/env.mjs'

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    process.env.NODE_ENV = 'test'
    process.env.LOG_LEVEL = 'debug'
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    jest.clearAllMocks()
  })

  it('should format errors correctly in test environment', () => {
    const logger = Logger.getInstance()
    const testError = new Error('Test error')

    logger.error('Test error occurred', {
      error: testError,
      component: 'TestComponent',
      context: { test: true },
    })

    expect(consoleSpy).toHaveBeenCalled()
    const loggedData = JSON.parse(consoleSpy.mock.calls[0][0])

    expect(loggedData).toMatchObject({
      level: LogLevel.ERROR,
      message: 'Test error occurred',
      component: 'TestComponent',
      context: { test: true },
      environment: 'test',
    })
    expect(loggedData.error).toHaveProperty('stack')
  })
})
