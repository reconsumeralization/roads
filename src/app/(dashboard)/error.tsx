'use client'

import { useEffect } from 'react'
import { useToast } from '@/hooks/useToast'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { toast } = useToast()

  useEffect(() => {
    console.error(error)
    toast({
      title: 'Dashboard Error',
      description: error.message || 'An error occurred in the dashboard.',
      variant: 'destructive',
    })
  }, [error])

  return (
    <main className="flex h-full flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Dashboard Error</h2>
      <p className="text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
      >
        Try again
      </button>
    </main>
  )
}
