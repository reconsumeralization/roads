'use client'

import { useEffect } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ErrorDisplayProps {
  error: Error & { digest?: string }
  reset?: () => void
  showHomeButton?: boolean
  customMessage?: string
}

export default function ErrorDisplay({
  error,
  reset,
  showHomeButton = true,
  customMessage
}: ErrorDisplayProps) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Error occurred:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack
    })
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />

        <h2 className="text-2xl font-semibold text-gray-900">
          {customMessage || 'Something went wrong!'}
        </h2>

        <p className="text-gray-600 max-w-md mx-auto">
          {error.digest
            ? `Error ID: ${error.digest}`
            : 'We encountered an unexpected error'}
        </p>

        <div className="flex gap-4 justify-center mt-6">
          {reset && (
            <button
              onClick={reset}
              className="inline-flex items-center px-4 py-2 rounded-md
                       bg-blue-500 text-white hover:bg-blue-600
                       transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Try again
            </button>
          )}

          {showHomeButton && (
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-md
                       border border-gray-300 text-gray-700
                       hover:bg-gray-50 transition-colors"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go home
            </Link>
          )}
        </div>
      </div>
    </div>
  )
} 
