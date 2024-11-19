'use client'

import { useEffect } from 'react'
import { useToast } from '@/hooks/useToast'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { toast } = useToast()

  useEffect(() => {
    // Log to error reporting service
    console.error(error)

    // Show error toast
    toast({
      title: 'Application Error',
      description: 'Something went wrong. Please try again.',
      variant: 'destructive',
    })
  }, [error])

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <button
            onClick={reset}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
