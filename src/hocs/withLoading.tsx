import React, { ComponentType, useState, useEffect } from 'react'

interface WithLoadingProps {
  isLoading?: boolean
}

export function withLoading<P extends WithLoadingProps>(
  WrappedComponent: ComponentType<P>,
  loadingComponent?: React.ReactNode
) {
  return function LoadingHOC(props: Omit<P, keyof WithLoadingProps>) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      // Simulate loading delay - replace with real loading logic
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
      return (
        loadingComponent || (
          <div className="loading">
            <span>Loading...</span>
          </div>
        )
      )
    }

    return <WrappedComponent {...(props as P)} isLoading={isLoading} />
  }
}
