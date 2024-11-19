import React, { Component, ComponentType } from 'react'
import { useNotificationStore } from '@/stores/useNotificationStore'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return class ErrorBoundaryHOC extends Component<P, ErrorBoundaryState> {
    state = {
      hasError: false,
      error: null,
    }

    static getDerivedStateFromError(error: Error) {
      return {
        hasError: true,
        error,
      }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      // Log the error to your error tracking service
      console.error('Error caught by boundary:', error, errorInfo)

      // Send notification using the store
      const { sendNotification } = useNotificationStore.getState()
      sendNotification({
        type: 'ERROR',
        message: 'An unexpected error occurred',
        data: {
          error: error.message,
          componentStack: errorInfo.componentStack,
        },
      })
    }

    render() {
      if (this.state.hasError) {
        return (
          fallback || (
            <div className="error-boundary">
              <h2>Something went wrong</h2>
              <p>{this.state.error?.message}</p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try again
              </button>
            </div>
          )
        )
      }

      return <WrappedComponent {...this.props} />
    }
  }
}
