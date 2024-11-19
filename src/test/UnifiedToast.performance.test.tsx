import { render, act } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext } from './toast-test-utils'

describe('UnifiedToast Performance Tests', () => {
  let gpuMemoryInfo: any = null
  let frameMetrics: { timestamp: number; memory: number; fps: number }[] = []

  beforeEach(() => {
    frameMetrics = []
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      gpuMemoryInfo = gl.getParameter(ext?.UNMASKED_RENDERER_WEBGL)
    }
  })

  // Track frame metrics during animations
  function trackFrameMetrics() {
    let lastTime = performance.now()
    let frameCount = 0

    return {
      measure: () => {
        const now = performance.now()
        const elapsed = now - lastTime
        frameCount++

        if (elapsed >= 1000) {
          // Every second
          const fps = (frameCount * 1000) / elapsed
          const memory = performance.memory?.usedJSHeapSize || 0

          frameMetrics.push({
            timestamp: now,
            memory,
            fps,
          })

          frameCount = 0
          lastTime = now
        }
      },
    }
  }

  it('maintains stable performance during complex animations', async () => {
    const { context } = mockWebGLContext()
    const metrics = trackFrameMetrics()

    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'perf-test',
          title: 'Performance Test',
          variant: 'success',
        }}
        onDismiss={() => {}}
      />
    )

    // Run complex animations for 5 seconds
    await act(async () => {
      const startTime = performance.now()
      while (performance.now() - startTime < 5000) {
        // Trigger shader updates
        container
          .querySelector('canvas')
          ?.dispatchEvent(new CustomEvent('webglcontextrestored'))

        // Measure frame metrics
        metrics.measure()

        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
    })

    // Analyze performance metrics
    const avgFps =
      frameMetrics.reduce((sum, m) => sum + m.fps, 0) / frameMetrics.length
    const memoryGrowth =
      frameMetrics[frameMetrics.length - 1].memory - frameMetrics[0].memory
    const fpsVariance = Math.sqrt(
      frameMetrics.reduce((sum, m) => sum + Math.pow(m.fps - avgFps, 2), 0) /
        frameMetrics.length
    )

    // Performance assertions
    expect(avgFps).toBeGreaterThan(30) // Should maintain at least 30fps
    expect(memoryGrowth).toBeLessThan(1024 * 1024) // Less than 1MB growth
    expect(fpsVariance).toBeLessThan(10) // FPS should be stable
  })

  it('handles shader recompilation efficiently', async () => {
    const initialGPUMemory = await getGPUMemoryUsage()
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'shader-test',
          title: 'Shader Test',
          variant: 'success',
        }}
        onDismiss={() => {}}
      />
    )

    // Force multiple shader recompilations
    await act(async () => {
      for (let i = 0; i < 20; i++) {
        // Change shader variant to force recompilation
        container.querySelector('canvas')?.dispatchEvent(
          new CustomEvent('variantchange', {
            detail: { variant: i % 3 },
          })
        )
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    })

    const finalGPUMemory = await getGPUMemoryUsage()
    expect(finalGPUMemory - initialGPUMemory).toBeLessThan(1024 * 1024) // Less than 1MB GPU memory growth
  })

  it('maintains animation smoothness during gesture interactions', async () => {
    const metrics = trackFrameMetrics()
    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'gesture-test',
          title: 'Gesture Test',
        }}
        onDismiss={() => {}}
      />
    )

    await act(async () => {
      // Simulate complex gesture sequence
      for (let i = 0; i < 100; i++) {
        const x = Math.sin(i / 10) * 100
        const y = Math.cos(i / 10) * 50

        container.querySelector('[role="alert"]')?.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: x,
            clientY: y,
            bubbles: true,
          })
        )

        metrics.measure()
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
    })

    // Analyze gesture performance
    const lowFpsFrames = frameMetrics.filter((m) => m.fps < 30).length
    expect(lowFpsFrames).toBeLessThan(frameMetrics.length * 0.1) // Less than 10% of frames below 30fps
  })

  // Helper function to estimate GPU memory usage
  async function getGPUMemoryUsage(): Promise<number> {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return 0

    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    if (!ext) return 0

    // Create a test texture to measure memory impact
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1024,
      1024,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    )

    // Force GPU to process commands
    gl.flush()
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Clean up
    gl.deleteTexture(tex)

    return performance.memory?.usedJSHeapSize || 0
  }
})
