import { render, act } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext } from './toast-test-utils'

describe('UnifiedToast Shader Performance', () => {
  let shaderMetrics: {
    compilationTime: number
    memoryUsage: number
    uniformUpdates: number
    timestamp: number
  }[] = []

  beforeEach(() => {
    shaderMetrics = []
  })

  // Track shader compilation and memory metrics
  function trackShaderMetrics(gl: WebGLRenderingContext) {
    const originalCreateProgram = gl.createProgram
    const originalUseProgram = gl.useProgram
    const originalUniform = gl.uniform1f

    let activeProgram: WebGLProgram | null = null
    let uniformUpdates = 0

    // Monitor shader program creation and compilation
    gl.createProgram = function () {
      const startTime = performance.now()
      const program = originalCreateProgram.call(gl)

      if (program) {
        shaderMetrics.push({
          compilationTime: performance.now() - startTime,
          memoryUsage: estimateShaderMemory(gl, program),
          uniformUpdates: 0,
          timestamp: Date.now(),
        })
      }

      return program
    }

    // Track active shader program
    gl.useProgram = function (program) {
      activeProgram = program
      originalUseProgram.call(gl, program)
    }

    // Monitor uniform updates
    gl.uniform1f = function (location, value) {
      uniformUpdates++
      if (activeProgram) {
        const metric = shaderMetrics.find(
          (m) => m.timestamp === getShaderTimestamp(gl, activeProgram)
        )
        if (metric) {
          metric.uniformUpdates = uniformUpdates
        }
      }
      return originalUniform.call(gl, location, value)
    }

    return {
      restore: () => {
        gl.createProgram = originalCreateProgram
        gl.useProgram = originalUseProgram
        gl.uniform1f = originalUniform
      },
    }
  }

  // Estimate shader program memory usage
  function estimateShaderMemory(
    gl: WebGLRenderingContext,
    program: WebGLProgram
  ): number {
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)

    // Rough estimation based on typical sizes
    const uniformSize = 16 // Average size of uniform in bytes
    const attributeSize = 12 // Average size of attribute in bytes
    const programOverhead = 1024 // Base program size in bytes

    return (
      programOverhead +
      numUniforms * uniformSize +
      numAttributes * attributeSize
    )
  }

  // Get shader program creation timestamp
  function getShaderTimestamp(
    gl: WebGLRenderingContext,
    program: WebGLProgram
  ): number {
    return Number(gl.getProgramParameter(program, gl.ATTACHED_SHADERS))
  }

  it('maintains efficient shader compilation and memory usage', async () => {
    const { context } = mockWebGLContext()
    const metrics = trackShaderMetrics(context as WebGLRenderingContext)

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

    // Force shader recompilations with different variants
    await act(async () => {
      for (let i = 0; i < 10; i++) {
        container.querySelector('canvas')?.dispatchEvent(
          new CustomEvent('variantchange', {
            detail: { variant: i % 3 },
          })
        )
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    })

    metrics.restore()

    // Analyze shader metrics
    const avgCompilationTime =
      shaderMetrics.reduce((sum, m) => sum + m.compilationTime, 0) /
      shaderMetrics.length
    const maxMemoryUsage = Math.max(...shaderMetrics.map((m) => m.memoryUsage))
    const totalUniformUpdates = shaderMetrics.reduce(
      (sum, m) => sum + m.uniformUpdates,
      0
    )

    // Performance assertions
    expect(avgCompilationTime).toBeLessThan(5) // Less than 5ms per compilation
    expect(maxMemoryUsage).toBeLessThan(4096) // Less than 4KB per shader
    expect(totalUniformUpdates).toBeLessThan(1000) // Reasonable number of updates
  })

  it('handles CPU/GPU synchronization efficiently', async () => {
    const { context } = mockWebGLContext()
    const gl = context as WebGLRenderingContext
    const syncPoints: number[] = []

    // Track sync points
    const originalFinish = gl.finish
    gl.finish = function () {
      const startTime = performance.now()
      originalFinish.call(gl)
      syncPoints.push(performance.now() - startTime)
    }

    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'sync-test',
          title: 'Sync Test',
        }}
        onDismiss={() => {}}
      />
    )

    // Test rapid updates requiring sync
    await act(async () => {
      for (let i = 0; i < 30; i++) {
        // Update uniforms and force sync
        container.querySelector('canvas')?.dispatchEvent(
          new CustomEvent('uniformupdate', {
            detail: { value: Math.random() },
          })
        )
        gl.finish()
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
    })

    gl.finish = originalFinish

    // Analyze sync performance
    const avgSyncTime = syncPoints.reduce((a, b) => a + b) / syncPoints.length
    const maxSyncTime = Math.max(...syncPoints)

    // Sync performance assertions
    expect(avgSyncTime).toBeLessThan(1) // Less than 1ms average sync time
    expect(maxSyncTime).toBeLessThan(5) // Less than 5ms max sync time
    expect(syncPoints.length).toBeGreaterThan(0) // Ensure syncs occurred
  })
})
