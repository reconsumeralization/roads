'use client'

import ErrorDisplay from '@/components/shared/ErrorDisplay'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <ErrorDisplay
          error={error}
          reset={reset}
          customMessage="Application Error"
        />
      </body>
    </html>
  )
}
