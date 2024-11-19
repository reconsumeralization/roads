import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useGesture } from '@use-gesture/react'
import { useSound } from '@/hooks/useSound'
import { UnifiedToastMaterial } from '@/shaders/unified-toast'
import { useToastStore } from '@/stores/useToastStore'
import { useA11y } from '@/hooks/useA11y'
import { ToastError } from '@/types/errors'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { reportToastError } from '@/utils/error-reporting'
import { ToastErrorCode } from '@/types/toast-errors'
import { ToastErrorRecovery } from '@/utils/error-recovery'

interface UnifiedToastProps {
  toast: ToasterToast
  onDismiss: () => void
}

export function UnifiedToast({ toast, onDismiss }: UnifiedToastProps) {
  const toastRef = useRef()
  const materialRef = useRef()
  const progressRef = useRef(1)
  const { pauseToast, resumeToast } = useToastStore()
  const { announce } = useA11y()

  // Enhanced sound effects with volume control
  const { play: playAppear } = useSound('/sounds/toast-appear.mp3', {
    volume: 0.7,
  })
  const { play: playDismiss } = useSound('/sounds/toast-dismiss.mp3', {
    volume: 0.7,
  })
  const { play: playHover } = useSound('/sounds/toast-hover.mp3', {
    volume: 0.5,
  })
  const { play: playSwipe } = useSound('/sounds/toast-swipe.mp3', {
    volume: 0.6,
  })

  // Enhanced springs with more natural motion
  const [springs, api] = useSpring(() => ({
    position: [0, 0, -10],
    rotation: [0, 0, 0],
    scale: [0, 0, 0],
    config: {
      tension: 200,
      friction: 20,
      mass: 1,
      bounce: 0.3,
    },
  }))

  const errorRecovery = new ToastErrorRecovery(reportToastError)

  // Initialize recovery strategies
  useEffect(() => {
    errorRecovery.addStrategy(ToastErrorCode.ANIMATION_FAILURE, {
      recover: () => {
        // Reset animation state
        api.start({
          position: [0, 0, 0],
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
        })
      },
      fallback: () => {
        // Fallback to basic toast if animations repeatedly fail
        onDismiss()
      },
      retryCount: 0,
      maxRetries: 2,
    })

    errorRecovery.addStrategy(ToastErrorCode.WEBGL_CONTEXT_LOST, {
      recover: () => {
        // Attempt to restore WebGL context
        const canvas = toastRef.current?.parent?.gl?.domElement
        if (canvas) {
          canvas
            .getContext('webgl2')
            ?.getExtension('WEBGL_lose_context')
            ?.restoreContext()
        }
      },
      fallback: onDismiss,
      retryCount: 0,
      maxRetries: 1,
    })
  }, [])

  // Update error handling
  const handleError = async (error: Error, code: ToastErrorCode) => {
    const toastError = new ToastError(error.message, code)
    await errorRecovery.handleError(toastError, {
      toastId: toast.id,
      toastVariant: toast.variant,
    })
  }

  // Enhanced gesture handling with error reporting
  const bind = useGesture({
    onDrag: ({ movement: [x, y], velocity, direction: [dx] }) => {
      try {
        const trigger = velocity > 0.2
        const swipeDirection = dx > 0 ? 'right' : 'left'

        if (materialRef.current) {
          materialRef.current.dismiss = Math.min(Math.abs(x) / 100, 1)
          materialRef.current.swipeDirection = dx
        }

        // Add vertical bounce effect
        api.start({
          position: [x, y * 0.2, 0],
          rotation: [0, 0, -x * 0.01],
          scale: [1 - Math.abs(x) / 500, 1 + Math.abs(y) / 500, 1],
          onRest: () => {
            if (trigger) {
              playSwipe()
              announce(`Toast dismissed by swiping ${swipeDirection}`)
              onDismiss()
            }
          },
        })
      } catch (error) {
        handleError(error, ToastErrorCode.GESTURE_FAILURE)
      }
    },
    onHover: ({ hovering }) => {
      if (materialRef.current) {
        materialRef.current.hover = hovering ? 1 : 0
      }

      if (hovering) {
        playHover()
        pauseToast(toast.id)
        api.start({
          scale: [1.05, 1.05, 1.05],
          rotation: [0, 0, 0.05],
          config: { tension: 300, friction: 10 },
        })
      } else {
        resumeToast(toast.id)
        api.start({
          scale: [1, 1, 1],
          rotation: [0, 0, 0],
          config: { tension: 200, friction: 20 },
        })
      }
    },
    onMove: ({ xy: [x, y] }) => {
      if (materialRef.current) {
        // Add subtle tilt effect based on cursor position
        const tiltX = (y / window.innerHeight - 0.5) * 0.2
        const tiltY = (x / window.innerWidth - 0.5) * 0.2
        api.start({
          rotation: [tiltX, tiltY, 0],
          config: { tension: 400, friction: 30 },
        })
      }
    },
  })

  // WebGL context loss handling
  useEffect(() => {
    const canvas = toastRef.current?.parent?.gl?.domElement
    if (!canvas) return

    const handleContextLost = (event: WebGLContextEvent) => {
      event.preventDefault()
      handleError(
        new Error('WebGL context lost'),
        ToastErrorCode.WEBGL_CONTEXT_LOST
      )
    }

    canvas.addEventListener('webglcontextlost', handleContextLost)
    return () =>
      canvas.removeEventListener('webglcontextlost', handleContextLost)
  }, [])

  // Accessibility announcements
  useEffect(() => {
    announce(
      `${toast.variant || 'info'} notification: ${toast.title}${toast.description ? `, ${toast.description}` : ''}`
    )
    playAppear()

    api.start({
      from: {
        position: [0, -50, 0],
        scale: [0.8, 0.8, 0.8],
        rotation: [0, 0, -0.2],
      },
      to: {
        position: [0, 0, 0],
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      },
    })

    return () => {
      announce('Notification dismissed')
    }
  }, [])

  // Combined animation handling
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.time = clock.getElapsedTime()
      materialRef.current.progress = progressRef.current
    }
  })

  // Entry animation and cleanup
  useEffect(() => {
    playAppear()
    api.start({
      position: [0, 0, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
    })

    // Progress bar animation (from Toast3D)
    if (toast.duration && toast.duration !== Infinity) {
      const startTime = performance.now()
      const animate = () => {
        const elapsed = performance.now() - startTime
        progressRef.current = 1 - elapsed / toast.duration
        if (progressRef.current > 0) {
          requestAnimationFrame(animate)
        } else {
          onDismiss()
        }
      }
      requestAnimationFrame(animate)
    }
  }, [])

  return (
    <ErrorBoundary
      fallback={<BasicToast toast={toast} onDismiss={onDismiss} />}
    >
      <animated.group
        {...springs}
        {...bind()}
        ref={toastRef}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <mesh>
          <planeGeometry args={[4, 1]} />
          <unifiedToastMaterial
            ref={materialRef}
            transparent
            color={toast.variant === 'destructive' ? [1, 0.3, 0.3] : [1, 1, 1]}
            progress={progressRef.current}
            hover={0}
            dismiss={0}
            variant={
              toast.variant === 'success'
                ? 1
                : toast.variant === 'destructive'
                  ? 2
                  : toast.variant === 'warning'
                    ? 3
                    : 0
            }
            chromaticStrength={0.003}
          />
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
    </ErrorBoundary>
  )
}
