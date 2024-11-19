import { render, act, cleanup } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext } from './toast-test-utils'

describe('UnifiedToast Memory Tests', () => {
  let memoryEntries: PerformanceEntry[] = []
  let gpuMemoryInfo: any = null

  beforeEach(() => {
    memoryEntries = []
    performance.mark('test-start')

    // Get initial GPU memory state
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      gpuMemoryInfo = gl.getParameter(ext?.UNMASKED_RENDERER_WEBGL)
    }
  })

  afterEach(() => {
    performance.mark('test-end')
    performance.measure('test-memory', 'test-start', 'test-end')
    cleanup()
  })

  it('should not leak memory during rapid mount/unmount cycles', async () => {
    const initialMemory = performance.memory?.usedJSHeapSize
    const heapSnapshots: number[] = []

    // Test rapid mount/unmount cycles
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <UnifiedToast
          toast={{
            id: `test-${i}`,
            title: 'Memory Test',
            duration: 100,
          }}
          onDismiss={() => {}}
        />
      )

      await act(async () => {
        // Trigger animations and gestures
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      heapSnapshots.push(performance.memory?.usedJSHeapSize || 0)
      unmount()
    }

    // Check for memory growth pattern
    const memoryGrowth = heapSnapshots.map((mem, i) =>
      i > 0 ? mem - heapSnapshots[i - 1] : 0
    )

    // Memory should not grow consistently
    const consistentGrowth = memoryGrowth.filter((growth) => growth > 0).length
    expect(consistentGrowth).toBeLessThan(memoryGrowth.length * 0.5)

    const finalMemory = performance.memory?.usedJSHeapSize
    const memoryDiff = finalMemory - initialMemory
    expect(memoryDiff).toBeLessThan(1024 * 1024) // Less than 1MB growth
  })

  it('should cleanup WebGL resources properly', async () => {
    const { context } = mockWebGLContext()
    const gl = context as WebGLRenderingContext
    const initialResources = countWebGLResources(gl)

    const { unmount } = render(
      <UnifiedToast
        toast={{
          id: 'webgl-test',
          title: 'WebGL Memory Test',
          duration: 1000,
        }}
        onDismiss={() => {}}
      />
    )

    // Trigger animations and shader updates
    await act(async () => {
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
    })

    unmount()

    // Wait for cleanup
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    const finalResources = countWebGLResources(gl)
    expect(finalResources).toEqual(initialResources)
  })

  it('should handle shader recompilation without leaking', async () => {
    const initialMemory = performance.memory?.usedJSHeapSize
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

    // Force shader recompilations
    await act(async () => {
      for (let i = 0; i < 20; i++) {
        container
          .querySelector('canvas')
          ?.dispatchEvent(new CustomEvent('webglcontextrestored'))
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    })

    const finalMemory = performance.memory?.usedJSHeapSize
    expect(finalMemory - initialMemory).toBeLessThan(512 * 1024) // Less than 512KB growth
  })

  // Helper function to count WebGL resources
  function countWebGLResources(gl: WebGLRenderingContext) {
    return {
      textures: gl.getParameter(gl.TEXTURE_BINDING_2D),
      buffers: gl.getParameter(gl.ARRAY_BUFFER_BINDING),
      framebuffers: gl.getParameter(gl.FRAMEBUFFER_BINDING),
      shaders: gl.getParameter(gl.CURRENT_PROGRAM),
    }
  }
})
