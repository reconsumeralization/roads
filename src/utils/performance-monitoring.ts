type PerformanceMetric = {
  timestamp: number
  duration: number
  type: 'animation' | 'render' | 'gesture' | 'webgl'
  context?: any
}

export class ToastPerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private thresholds = {
    animation: 16, // 60fps target
    render: 50, // Max render time
    gesture: 100, // Max gesture response time
    webgl: 33, // ~30fps minimum for WebGL
  }

  constructor(
    private readonly onPerformanceIssue: (metric: PerformanceMetric) => void
  ) {}

  measureTime(
    type: PerformanceMetric['type'],
    callback: () => void,
    context?: any
  ) {
    const start = performance.now()
    callback()
    const duration = performance.now() - start

    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      duration,
      type,
      context,
    }

    this.metrics.push(metric)
    this.checkThreshold(metric)
  }

  async measureAsync(
    type: PerformanceMetric['type'],
    callback: () => Promise<void>,
    context?: any
  ) {
    const start = performance.now()
    await callback()
    const duration = performance.now() - start

    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      duration,
      type,
      context,
    }

    this.metrics.push(metric)
    this.checkThreshold(metric)
  }

  private checkThreshold(metric: PerformanceMetric) {
    const threshold = this.thresholds[metric.type]
    if (metric.duration > threshold) {
      this.onPerformanceIssue(metric)
    }
  }

  getMetrics() {
    return this.metrics
  }

  getAverageMetric(type: PerformanceMetric['type']) {
    const typeMetrics = this.metrics.filter((m) => m.type === type)
    if (!typeMetrics.length) return 0

    const sum = typeMetrics.reduce((acc, curr) => acc + curr.duration, 0)
    return sum / typeMetrics.length
  }

  clearMetrics() {
    this.metrics = []
  }
}
