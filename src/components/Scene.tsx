import { Canvas } from '@react-three/fiber'
import { useToastStore } from '@/stores/useToastStore'

export function Scene() {
  const { toasts } = useToastStore()

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {/* Toast container */}
      <group position={[0, 2, 0]}>
        {toasts.map((toast, i) => (
          <Toast3D
            key={toast.id}
            toast={toast}
            position-y={i * -1.2}
            onDismiss={() => useToastStore.getState().dismissToast(toast.id)}
          />
        ))}
      </group>

      {/* Your other 3D content */}
    </Canvas>
  )
}
