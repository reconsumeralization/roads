import { render, act } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext } from './toast-test-utils'

describe('UnifiedToast GPU Memory', () => {
  const { context } = mockWebGLContext()
  let gpuMemoryInfo: WebGLMemoryInfo | null = null

  beforeEach(() => {
    const ext = context.getExtension('WEBGL_memory_info')
    if (ext) {
      gpuMemoryInfo = {
        totalAvailableMemoryKB: context.getParameter(
          ext.GPU_MEMORY_INFO_TOTAL_AVAILABLE_MEMORY_NVX
        ),
        currentAvailableMemoryKB: context.getParameter(
          ext.GPU_MEMORY_INFO_CURRENT_AVAILABLE_VIDMEM_NVX
        ),
      }
    }
  })

  it('maintains stable GPU memory usage during animations', async () => {
    if (!gpuMemoryInfo) {
      console.warn('GPU memory info not available')
      return
    }

    const initialMemory = gpuMemoryInfo.currentAvailableMemoryKB
    const memoryReadings: number[] = []

    const { rerender } = render(
      <UnifiedToast
        toast={{
          id: 'gpu-test',
          title: 'GPU Memory Test',
        }}
        onDismiss={() => {}}
      />
    )

    // Monitor GPU memory during animations
    await act(async () => {
      for (let i = 0; i < 60; i++) {
        const currentMemory = context.getParameter(
          context.getExtension('WEBGL_memory_info')!
            .GPU_MEMORY_INFO_CURRENT_AVAILABLE_VIDMEM_NVX
        )
        memoryReadings.push(currentMemory)
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
    })

    const maxMemoryUsed = Math.max(
      ...memoryReadings.map((m) => initialMemory - m)
    )
    expect(maxMemoryUsed).toBeLessThan(50 * 1024) // Less than 50MB GPU memory usage
  })
})
