'use server'

import { handleError, AppError } from '@/utils/errors'

export async function serverAction(data: unknown) {
  try {
    // Validate input
    if (!data) {
      throw AppError.BadRequest('Missing required data')
    }

    // Perform action
    const result = await performAction(data)

    if (!result) {
      throw AppError.NotFound('Resource not found')
    }

    return result

  } catch (error) {
    const appError = handleError(error)

    // Log error with additional context
    console.error('Server action failed:', {
      action: 'serverAction',
      error: appError.toJSON(),
      data
    })

    throw appError // Will be caught by error boundary
  }
}
