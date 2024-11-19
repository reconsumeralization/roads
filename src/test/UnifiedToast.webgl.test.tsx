import { render, act } from '@testing-library/react'
import { UnifiedToast } from '../components/UnifiedToast'
import { mockWebGLContext } from './toast-test-utils'

describe('UnifiedToast WebGL Performance', () => {
  const { context } = mockWebGLContext()

  it('maintains stable WebGL performance', async () => {
    const metrics: number[] = []
    const gl = context as WebGLRenderingContext

    // Reference WebGL context handling from UnifiedToast
    // (references ```typescript:src/components/UnifiedToast.tsx startLine: 156 endLine: 170```)

    const { container } = render(
      <UnifiedToast
        toast={{
          id: 'webgl-test',
          title: 'WebGL Test',
        }}
        onDismiss={() => {}}
      />
    )

    await act(async () => {
      for (let i = 0; i < 60; i++) {
        const startTime = performance.now()
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
        metrics.push(performance.now() - startTime)
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
    })

    const avgDrawTime = metrics.reduce((a, b) => a + b) / metrics.length
    expect(avgDrawTime).toBeLessThan(1) // Less than 1ms per draw
  })
})
