import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion-3d'
import { useSpring } from '@react-spring/three'
import { useGesture } from '@use-gesture/react'
import { useToastStore } from '@/stores/useToastStore'

interface Toast3DProps {
  toast: Toast
  onDismiss: () => void
}

export function Toast3D({ toast, onDismiss }: Toast3DProps) {
  const progressRef = useRef<number>(0)
  const { pauseToast, resumeToast } = useToastStore()

  // 3D animation springs
  const [springs, api] = useSpring(() => ({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
    config: { tension: 200, friction: 20 },
  }))

  // Gesture handling
  const bind = useGesture({
    onDrag: ({ movement: [x], velocity }) => {
      const trigger = velocity > 0.2
      api.start({
        position: [x, 0, 0],
        scale: 1 - Math.abs(x) / 500,
        onRest: () => {
          if (trigger) onDismiss()
        },
      })
    },
    onHover: ({ hovering }) => {
      if (hovering) {
        pauseToast(toast.id)
        api.start({ scale: 1.05 })
      } else {
        resumeToast(toast.id)
        api.start({ scale: 1 })
      }
    },
  })

  // Progress bar animation
  useEffect(() => {
    if (!toast.duration || toast.duration === Infinity) return

    const startTime = performance.now()
    const duration = toast.duration

    const animate = () => {
      const elapsed = performance.now() - startTime
      progressRef.current = 1 - elapsed / duration

      if (progressRef.current > 0) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [toast.duration])

  return (
    <motion.group {...springs} {...bind()}>
      <mesh>
        {/* Toast background */}
        <planeGeometry args={[4, 1]} />
        <meshStandardMaterial color={getVariantColor(toast.variant)} />

        {/* Progress bar */}
        {progressRef.current > 0 && (
          <mesh position={[-2 + progressRef.current * 2, -0.45, 0.01]}>
            <planeGeometry args={[4 * progressRef.current, 0.1]} />
            <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
          </mesh>
        )}

        {/* Content */}
        <Text
          position={[-1.8, 0, 0.01]}
          fontSize={0.15}
          maxWidth={3.6}
          textAlign="left"
        >
          {toast.title}
        </Text>
      </mesh>
    </motion.group>
  )
}

function getVariantColor(variant: ToastVariant): string {
  switch (variant) {
    case 'SUCCESS':
      return '#4CAF50'
    case 'ERROR':
      return '#F44336'
    case 'WARNING':
      return '#FF9800'
    case 'INFO':
      return '#2196F3'
    default:
      return '#757575'
  }
}
