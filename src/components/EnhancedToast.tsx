import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useGLTF } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { ToastShaderMaterial } from '@/shaders/toast'
import { useSound } from '@/hooks/useSound'

interface EnhancedToastProps {
  toast: ToasterToast
  onDismiss: () => void
}

export function EnhancedToast({ toast, onDismiss }: EnhancedToastProps) {
  // Reference existing toast implementation
  const toastRef = useRef()
  const materialRef = useRef()

  // Sound effects
  const { play: playAppear } = useSound('/sounds/toast-appear.mp3')
  const { play: playDismiss } = useSound('/sounds/toast-dismiss.mp3')

  // Animation springs
  const [springs, api] = useSpring(() => ({
    scale: [0, 0, 0],
    position: [0, 0, -10],
    rotation: [0, 0, 0],
    config: { tension: 200, friction: 20 },
  }))

  useEffect(() => {
    playAppear()
    api.start({
      scale: [1, 1, 1],
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    })

    return () => {
      playDismiss()
    }
  }, [])

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.time = clock.getElapsedTime()
    }
  })

  return (
    <animated.group {...springs} ref={toastRef}>
      <mesh
        onClick={onDismiss}
        onPointerEnter={() => api.start({ scale: [1.1, 1.1, 1.1] })}
        onPointerLeave={() => api.start({ scale: [1, 1, 1] })}
        aria-label={toast.title}
        role="alert"
      >
        <planeGeometry args={[4, 1]} />
        <toastShaderMaterial ref={materialRef} transparent />

        <Text
          position={[0, 0, 0.1]}
          fontSize={0.15}
          maxWidth={3.5}
          textAlign="center"
          color="#ffffff"
        >
          {toast.title}
        </Text>

        {toast.description && (
          <Text
            position={[0, -0.2, 0.1]}
            fontSize={0.12}
            maxWidth={3.5}
            textAlign="center"
            color="#ffffff"
          >
            {toast.description}
          </Text>
        )}
      </mesh>
    </animated.group>
  )
}
