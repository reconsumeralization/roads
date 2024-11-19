'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { getErrorMessage } from '../utils/errors'

interface ErrorDisplayProps {
  error: Error & { digest?: string }
  reset?: () => void
  showHomeButton?: boolean
}

export function ErrorDisplay({ error, reset, showHomeButton = true }: ErrorDisplayProps) {
  const message = getErrorMessage(error)

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
      <div className="text-red-500 mb-4">
        <AlertTriangle className="h-12 w-12" />
      </div>

      <h2 className="text-xl font-semibold mb-2">
        {process.env.NODE_ENV === 'development'
          ? message
          : 'Something went wrong'}
      </h2>

      {error.digest && (
        <p className="text-sm text-gray-500 mb-4">
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex gap-4">
        {reset && (
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
        )}
        {showHomeButton && (
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go home
          </Link>
        )}
      </div>
    </div>
  )
}
