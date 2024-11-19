import { shaderMaterial } from '@react-three/drei'

export const ToastShaderMaterial = shaderMaterial(
  {
    time: 0,
    color: [1.0, 1.0, 1.0],
    progress: 1.0,
  },
  // Vertex shader
  /*glsl*/ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  /*glsl*/ `
    uniform float time;
    uniform vec3 color;
    uniform float progress;
    varying vec2 vUv;

    void main() {
      float alpha = smoothstep(0.0, 0.1, progress) *
                   smoothstep(1.0, 0.9, progress);
      vec3 glow = color * (0.5 + 0.5 * sin(time * 2.0));
      gl_FragColor = vec4(glow, alpha);
    }
  `
)
