import { shaderMaterial } from '@react-three/drei'

export const UnifiedToastMaterial = shaderMaterial(
  {
    time: 0,
    color: [1.0, 1.0, 1.0],
    progress: 1.0,
    hover: 0,
    dismiss: 0,
    variant: 0,
    chromaticStrength: 0.003,
    swipeDirection: 0.0,
    devicePixelRatio: 1.0,
    particleScale: 1.0,
    interactionStrength: 0.0,
  },
  // Enhanced vertex shader with more particle interactions
  /*glsl*/ `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vElevation;
    uniform float time;
    uniform float hover;
    uniform float dismiss;
    uniform float swipeDirection;
    uniform float devicePixelRatio;
    uniform float particleScale;
    uniform float interactionStrength;

    // Optimized 3D noise
    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      vec2 uv = (i.xy + vec2(37.0, 17.0) * i.z) + f.xy;
      vec2 rg = vec2(
        fract(sin(dot(uv.xy, vec2(1.0, 113.0))) * 43758.5453),
        fract(cos(dot(uv.xy, vec2(7.0, 61.0))) * 32134.2351)
      );
      return mix(rg.x, rg.y, f.z);
    }

    void main() {
      vUv = uv;
      vPosition = position;

      vec3 pos = position;
      float t = time * (0.5 + 0.5 * devicePixelRatio);

      // Interactive particle effects based on variant
      if (variant == 1.0) { // Success: Spiral particles
        float angle = t * 2.0 + length(position.xy) * 4.0;
        float radius = 0.1 * (hover + interactionStrength);
        vec2 spiral = vec2(cos(angle), sin(angle)) * radius;
        pos.xy += spiral * noise(vec3(position.xy * 5.0, t * 0.5));
      }
      else if (variant == 2.0) { // Error: Explosive particles
        vec2 dir = normalize(position.xy);
        float force = noise(vec3(position.xy * 8.0, t * 0.8)) * (hover + interactionStrength);
        pos.xy += dir * force * 0.2;
      }
      else if (variant == 3.0) { // Warning: Wave particles
        float wave = sin(position.x * 5.0 + t * 3.0) * cos(position.y * 4.0 + t * 2.0);
        pos.z += wave * (hover + interactionStrength) * 0.1;
      }

      // Apply device-specific optimizations
      float effectScale = devicePixelRatio > 1.0 ? 1.0 : 0.5;
      pos = mix(position, pos, effectScale);

      // Enhanced swipe animation
      float swipeOffset = swipeDirection * dismiss * (1.0 + noise(vec3(position.xy * 3.0, t)));
      pos.x += swipeOffset;
      pos.z += swipeOffset * 0.2;

      // Hover effect with noise
      float hoverNoise = noise(vec3(position.xy * 4.0, t * 2.0)) * hover;
      pos.z += hoverNoise * 0.1;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      vElevation = length(pos - position);
    }
  `,
  // Enhanced fragment shader with improved effects
  /*glsl*/ `
    uniform float time;
    uniform vec3 color;
    uniform float progress;
    uniform float hover;
    uniform float dismiss;
    uniform float variant;
    uniform float chromaticStrength;
    uniform float interactionStrength;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vElevation;

    // Optimized hash function
    float hash(vec2 p) {
      p = fract(p * vec2(123.45, 456.78));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    vec3 getVariantColor(vec2 uv, float t) {
      if (variant == 1.0) { // Success
        return vec3(
          0.2 + 0.1 * sin(uv.x * 10.0 + t),
          0.8 + 0.1 * sin(uv.y * 8.0 + t * 1.2),
          0.4 + 0.1 * sin((uv.x + uv.y) * 6.0 + t * 0.8)
        );
      }
      else if (variant == 2.0) { // Error
        return vec3(
          0.9 + 0.1 * sin(uv.x * 12.0 + t * 1.5),
          0.2 + 0.1 * sin(uv.y * 10.0 + t),
          0.2 + 0.1 * sin((uv.x - uv.y) * 8.0 + t * 1.2)
        );
      }
      else if (variant == 3.0) { // Warning
        return vec3(
          0.9 + 0.1 * sin(uv.x * 8.0 + t),
          0.7 + 0.1 * sin(uv.y * 6.0 + t * 0.8),
          0.2 + 0.1 * sin((uv.x + uv.y) * 4.0 + t * 0.6)
        );
      }
      return color;
    }

    void main() {
      float t = time * (0.5 + 0.5 * devicePixelRatio);

      // Get base color with variant effects
      vec3 finalColor = getVariantColor(vUv, t);

      // Add interactive particle effects
      float interaction = hover + interactionStrength;
      if (interaction > 0.0) {
        vec2 particleUv = vUv * 20.0 + vec2(t * 0.5, sin(t) * 0.2);
        float particles = hash(particleUv) * interaction;

        if (variant == 1.0) { // Success particles
          particles *= sin(vUv.y * 10.0 + t * 2.0);
        } else if (variant == 2.0) { // Error particles
          particles *= sin(length(vUv - 0.5) * 10.0 + t * 3.0);
        } else if (variant == 3.0) { // Warning particles
          particles *= sin(vUv.x * 8.0 + t * 1.5);
        }

        finalColor += vec3(particles) * 0.15;
      }

      // Enhanced chromatic aberration
      float chromatic = chromaticStrength * (1.0 + interaction);
      vec2 direction = (vUv - 0.5) * 2.0;
      finalColor.r += length(direction) * chromatic;
      finalColor.b -= length(direction) * chromatic;

      // Progress indicator with variant-specific effects
      float prog = step(1.0 - progress - 0.02, vUv.x);
      prog *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

      if (variant > 0.0) {
        prog *= 1.0 + 0.2 * sin(t * (variant == 2.0 ? 8.0 : 4.0));
      }

      finalColor += getVariantColor(vUv, t) * prog * 0.3;

      // Smooth alpha transitions
      float alpha = (1.0 - dismiss * dismiss) *
                   smoothstep(0.0, 0.1, progress) *
                   smoothstep(1.0, 0.9, progress);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
)
