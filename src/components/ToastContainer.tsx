import { AnimatePresence } from 'framer-motion'
import { useToastStore } from '@/stores/useToastStore'
import { Toast3D } from './Toast3D'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="pointer-events-none fixed inset-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto absolute ${getPositionClasses(toast.position)}`}
          >
            <Toast3D toast={toast} onDismiss={() => removeToast(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function getPositionClasses(position: ToastPosition): string {
  switch (position) {
    case 'top-left':
      return 'top-4 left-4'
    case 'top-right':
      return 'top-4 right-4'
    case 'bottom-left':
      return 'bottom-4 left-4'
    case 'bottom-right':
      return 'bottom-4 right-4'
    default:
      return 'bottom-4 right-4'
  }
}
