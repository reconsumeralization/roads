import { vi } from 'vitest'

interface TestCanvasOptions {
  width?: number
  height?: number
  contextAttributes?: WebGLContextAttributes
}

export function createTestCanvas(options: TestCanvasOptions = {}) {
  const canvas = document.createElement('canvas')
  Object.assign(canvas, {
    width: 1024,
    height: 1024,
    ...options,
  })
  return canvas
}

export function mockWebGLContext(canvas: HTMLCanvasElement) {
  const contextAttributes: WebGLContextAttributes = {
    alpha: true,
    depth: true,
    stencil: true,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: 'default',
    failIfMajorPerformanceCaveat: false,
    desynchronized: false,
  }

  const gl = canvas.getContext(
    'webgl',
    contextAttributes
  ) as WebGLRenderingContext
  if (!gl) throw new Error('Failed to create WebGL context')

  // Track resource creation/deletion
  const resources = {
    textures: new Set<WebGLTexture>(),
    buffers: new Set<WebGLBuffer>(),
    programs: new Set<WebGLProgram>(),
    shaders: new Set<WebGLShader>(),
  }

  // Mock WebGL methods
  const originalMethods = {
    createTexture: gl.createTexture.bind(gl),
    deleteTexture: gl.deleteTexture.bind(gl),
    createBuffer: gl.createBuffer.bind(gl),
    deleteBuffer: gl.deleteBuffer.bind(gl),
    createProgram: gl.createProgram.bind(gl),
    deleteProgram: gl.deleteProgram.bind(gl),
  }

  // Enhance with tracking
  gl.createTexture = () => {
    const texture = originalMethods.createTexture()
    if (texture) resources.textures.add(texture)
    return texture
  }

  gl.deleteTexture = (texture: WebGLTexture | null) => {
    if (texture) resources.textures.delete(texture)
    return originalMethods.deleteTexture(texture)
  }

  gl.createBuffer = () => {
    const buffer = originalMethods.createBuffer()
    if (buffer) resources.buffers.add(buffer)
    return buffer
  }

  gl.deleteBuffer = (buffer: WebGLBuffer | null) => {
    if (buffer) resources.buffers.delete(buffer)
    return originalMethods.deleteBuffer(buffer)
  }

  // Add performance monitoring
  const metrics = {
    drawCalls: 0,
    textureUploads: 0,
    bufferUploads: 0,
    shaderCompilations: 0,
  }

  // Track draw calls
  const drawArrays = gl.drawArrays
  gl.drawArrays = (...args) => {
    metrics.drawCalls++
    return drawArrays.apply(gl, args)
  }

  // Add context loss simulation
  const loseContext = gl.getExtension('WEBGL_lose_context')

  return {
    gl,
    resources,
    metrics,
    simulateContextLoss: () => loseContext?.loseContext(),
    simulateContextRestore: () => loseContext?.restoreContext(),
    getResourceCounts: () => ({
      textures: resources.textures.size,
      buffers: resources.buffers.size,
      programs: resources.programs.size,
      shaders: resources.shaders.size,
    }),
  }
}

// Performance monitoring utilities
export function createPerformanceMonitor() {
  const metrics = {
    frames: 0,
    drawCalls: 0,
    frameDeltas: [] as number[],
    lastFrameTime: performance.now(),
  }

  return {
    trackFrame: () => {
      const now = performance.now()
      metrics.frameDeltas.push(now - metrics.lastFrameTime)
      metrics.lastFrameTime = now
      metrics.frames++
    },
    getMetrics: () => ({ ...metrics }),
    reset: () => {
      metrics.frames = 0
      metrics.drawCalls = 0
      metrics.frameDeltas = []
      metrics.lastFrameTime = performance.now()
    },
  }
}
