import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useToast } from '@/registry/new-york/hooks/use-toast'
import { EnhancedToast } from './EnhancedToast'

export function ToastProvider() {
  const { toasts } = useToast()

  return (
    <div className="pointer-events-none fixed inset-0">
      <Canvas>
        <Suspense fallback={null}>
          <group position={[0, 2, -5]}>
            {toasts.map((toast, i) => (
              <EnhancedToast
                key={toast.id}
                toast={toast}
                position-y={i * -1.2}
                onDismiss={() => toast.onOpenChange?.(false)}
              />
            ))}
          </group>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
        </Suspense>
      </Canvas>
    </div>
  )
}
