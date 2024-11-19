import { act } from '@testing-library/react'
import { ToastPerformanceMonitor } from '@/utils/performance-monitoring'

describe('Toast Performance Monitoring', () => {
  let performanceMonitor: ToastPerformanceMonitor
  const mockPerformanceIssue = jest.fn()

  beforeEach(() => {
    performanceMonitor = new ToastPerformanceMonitor(mockPerformanceIssue)
    mockPerformanceIssue.mockClear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('measures synchronous operations', () => {
    performanceMonitor.measureTime('animation', () => {
      // Simulate long operation
      jest.advanceTimersByTime(20)
    })

    const metrics = performanceMonitor.getMetrics()
    expect(metrics).toHaveLength(1)
    expect(metrics[0].type).toBe('animation')
    expect(metrics[0].duration).toBeGreaterThan(0)
  })

  it('measures asynchronous operations', async () => {
    await act(async () => {
      await performanceMonitor.measureAsync('render', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })
    })

    const metrics = performanceMonitor.getMetrics()
    expect(metrics).toHaveLength(1)
    expect(metrics[0].type).toBe('render')
    expect(metrics[0].duration).toBeGreaterThan(0)
  })

  it('reports performance issues when threshold exceeded', () => {
    performanceMonitor.measureTime('animation', () => {
      jest.advanceTimersByTime(50) // Exceeds animation threshold
    })

    expect(mockPerformanceIssue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'animation',
        duration: expect.any(Number),
      })
    )
  })

  it('calculates average metrics correctly', () => {
    performanceMonitor.measureTime('webgl', () => jest.advanceTimersByTime(10))
    performanceMonitor.measureTime('webgl', () => jest.advanceTimersByTime(20))

    const average = performanceMonitor.getAverageMetric('webgl')
    expect(average).toBe(15)
  })
})
