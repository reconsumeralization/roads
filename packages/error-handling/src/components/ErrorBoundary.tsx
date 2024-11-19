'use client'

import { Component, ReactNode } from 'react'
import { ErrorDisplay } from './ErrorDisplay'
import { logger } from '@/utils/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error & { digest?: string }
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React error boundary caught error', {
      error,
      component: 'ErrorBoundary',
      context: {
        componentStack: errorInfo.componentStack
      }
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorDisplay
          error={this.state.error!}
          reset={() => {
            logger.debug('Error boundary reset triggered', {
              component: 'ErrorBoundary'
            })
            this.setState({ hasError: false })
          }}
        />
      )
    }

    return this.props.children
  }
} 
