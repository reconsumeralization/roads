import { useToast } from '@/registry/new-york/hooks/use-toast'
import type { ComponentType } from 'react'

// Props that will be injected by the HOC
interface WithToastProps {
  showToast: (props: ToastProps) => void
  dismissToast: (id?: string) => void
}

export function withToast<P extends WithToastProps>(
  WrappedComponent: ComponentType<P>
) {
  // Create a proper display name for dev tools
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component'

  function WithToastComponent(props: Omit<P, keyof WithToastProps>) {
    const { toast, dismiss } = useToast()

    const showToast = (props: ToastProps) => {
      toast({
        ...props,
        // Allow override but provide sensible defaults
        duration: props.duration ?? 5000,
        variant: props.variant ?? 'default',
      })
    }

    return (
      <WrappedComponent
        {...(props as P)}
        showToast={showToast}
        dismissToast={dismiss}
      />
    )
  }

  WithToastComponent.displayName = `withToast(${displayName})`

  return WithToastComponent
}
