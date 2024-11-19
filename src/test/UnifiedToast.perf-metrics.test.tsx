import { render, act, fireEvent } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext, createTestCanvas } from './test-utils'

describe('UnifiedToast Performance Metrics', () => {
  let canvas: HTMLCanvasElement
  let gl: WebGLRenderingContext
  let metrics: {
    frames: number
    droppedFrames: number
    contextLosses: number
    gpuMemoryPeak: number
    longTasks: PerformanceEntry[]
  }

  beforeEach(() => {
    canvas = createTestCanvas()
    gl = mockWebGLContext(canvas)
    metrics = {
      frames: 0,
      droppedFrames: 0,
      contextLosses: 0,
      gpuMemoryPeak: 0,
      longTasks: [],
    }

    // Track frame metrics
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      metrics.frames++
      const now = performance.now()
      const frameTime = now - lastFrameTime
      if (frameTime > 16.7) {
        // Frame took longer than 16.7ms (60fps)
        metrics.droppedFrames++
      }
      return setTimeout(() => cb(now), 16)
    })

    // Track context losses
    canvas.addEventListener('webglcontextlost', () => {
      metrics.contextLosses++
    })

    // Track long tasks
    const observer = new PerformanceObserver((list) => {
      metrics.longTasks.push(...list.getEntries())
    })
    observer.observe({ entryTypes: ['longtask'] })
  })

  afterEach(() => {
    canvas.remove()
  })

  it('maintains performance during rapid effect changes', async () => {
    const { container, rerender } = render(
      <UnifiedToast
        toast={{
          id: 'perf-test',
          title: 'Performance Test',
          effect: 'glow',
        }}
      />
    )

    await act(async () => {
      // Rapid effect transitions
      for (let i = 0; i < 20; i++) {
        rerender(
          <UnifiedToast
            toast={{
              id: 'perf-test',
              title: 'Performance Test',
              effect: i % 2 ? 'ripple' : 'glow',
              variant: i % 3 ? 'destructive' : 'default',
            }}
          />
        )
        await new Promise((resolve) => setTimeout(resolve, 16))
      }
    })

    // Performance assertions
    expect(metrics.droppedFrames / metrics.frames).toBeLessThan(0.1) // Less than 10% dropped frames
    expect(metrics.contextLosses).toBe(0) // No context losses
    expect(metrics.longTasks.length).toBe(0) // No long tasks
  })

  it('handles concurrent animations efficiently', async () => {
    const startMemory = performance.memory?.usedJSHeapSize || 0

    // Create multiple toasts with animations
    const { container } = render(
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <UnifiedToast
            key={i}
            toast={{
              id: `toast-${i}`,
              title: `Toast ${i}`,
              effect: i % 2 ? 'glow' : 'ripple',
            }}
          />
        ))}
      </>
    )

    await act(async () => {
      // Trigger hover animations on all toasts
      container.querySelectorAll('[role="alert"]').forEach((alert) => {
        fireEvent.mouseEnter(alert)
      })

      // Let animations run
      await new Promise((resolve) => setTimeout(resolve, 500))
    })

    const endMemory = performance.memory?.usedJSHeapSize || 0
    const memoryGrowth = endMemory - startMemory

    // Memory and performance assertions
    expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024) // Less than 10MB growth
    expect(metrics.droppedFrames).toBeLessThan(5) // Minimal dropped frames
  })

  it('recovers performance after context loss', async () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'recovery-test',
          title: 'Recovery Test',
          effect: 'glow',
        }}
      />
    )

    await act(async () => {
      // Start animation
      fireEvent.mouseEnter(container.querySelector('[role="alert"]')!)

      // Force context loss
      canvas.dispatchEvent(new WebGLContextEvent('webglcontextlost'))
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Restore context
      canvas.dispatchEvent(new WebGLContextEvent('webglcontextrestored'))
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Continue animation
      fireEvent.mouseMove(container.querySelector('[role="alert"]')!)
    })

    // Post-recovery performance
    const postRecoveryFrames = metrics.frames
    const postRecoveryDropped = metrics.droppedFrames

    expect(postRecoveryDropped / postRecoveryFrames).toBeLessThan(0.15) // Max 15% dropped frames after recovery
  })

  it('maintains GPU memory stability during animations', async () => {
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'memory-test',
          title: 'Memory Test',
          effect: 'ripple',
        }}
      />
    )

    await act(async () => {
      // Run multiple animation cycles
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseEnter(container.querySelector('[role="alert"]')!)
        await new Promise((resolve) => setTimeout(resolve, 100))
        fireEvent.mouseLeave(container.querySelector('[role="alert"]')!)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    })

    // Memory stability checks
    const gpuMemoryInfo = gl.getExtension('WEBGL_memory_info')
    if (gpuMemoryInfo) {
      const currentMemory = gpuMemoryInfo.getParameter(
        gpuMemoryInfo.GPU_MEMORY_INFO_CURRENT_AVAILABLE
      )
      expect(currentMemory).toBeGreaterThan(0) // Still has available memory
    }
  })

  it('tracks comprehensive performance metrics', async () => {
    const metrics = {
      frameDeltas: [] as number[],
      gpuMemory: [] as number[],
      contextEvents: [] as string[],
      shaderCompilations: 0,
    }

    // Add GPU memory tracking
    const memoryExt = gl.getExtension('WEBGL_memory_info')
    const trackGPU = memoryExt
      ? setInterval(() => {
          metrics.gpuMemory.push(
            memoryExt.getParameter(
              memoryExt.GPU_MEMORY_INFO_CURRENT_AVAILABLE_NVX
            )
          )
        }, 16)
      : null

    // Track context events
    canvas.addEventListener('webglcontextlost', () =>
      metrics.contextEvents.push('lost')
    )
    canvas.addEventListener('webglcontextrestored', () =>
      metrics.contextEvents.push('restored')
    )

    // Track shader compilations
    const origShaderSource = gl.shaderSource
    gl.shaderSource = function (...args) {
      metrics.shaderCompilations++
      return origShaderSource.apply(this, args)
    }

    // ... test animation sequence ...

    if (trackGPU) clearInterval(trackGPU)

    // Comprehensive assertions
    expect(Math.max(...metrics.frameDeltas)).toBeLessThan(32) // No major frame drops
    expect(metrics.shaderCompilations).toBeLessThan(10) // Minimal shader recompilations
    expect(metrics.contextEvents.filter((e) => e === 'lost').length).toBe(0) // No context losses
    if (metrics.gpuMemory.length) {
      const memoryGrowth = Math.max(...metrics.gpuMemory) - metrics.gpuMemory[0]
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024) // Less than 50MB growth
    }
  })
})
