'use client'

import { useState } from 'react'
import { useTransition } from 'react'
import { serverAction } from '@/app/actions'
import { handleError } from '@/utils/error-handler'

interface ErrorState {
  message: string
  severity?: string
  field?: string
}

export default function FormWithErrorHandling() {
  const [error, setError] = useState<ErrorState | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      try {
        await serverAction(formData)
      } catch (e) {
        const errorResponse = handleError(e)
        setError(errorResponse)
      }
    })
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
      {error && (
        <div
          className={`mt-2 p-3 rounded ${
            error.severity === 'high'
              ? 'bg-red-100 text-red-700'
              : error.severity === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          <p className="font-medium">{error.message}</p>
          {error.field && (
            <p className="text-sm mt-1">Field: {error.field}</p>
          )}
        </div>
      )}
      <button
        disabled={isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
