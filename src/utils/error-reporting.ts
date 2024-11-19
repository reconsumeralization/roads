import * as Sentry from '@sentry/browser'

export const reportToastError = (error: ToastError) => {
  console.error(`Toast Error (${error.code}):`, error.message)

  Sentry.captureException(error, {
    tags: {
      errorType: 'toast',
      errorCode: error.code,
    },
    extra: {
      ...error.metadata,
    },
  })
}

export const handleShaderError = (error: Error) => {
  const toastError = new ToastError(
    error.message,
    ToastErrorCode.SHADER_COMPILATION,
    { originalError: error }
  )
  reportToastError(toastError)
  return toastError
}
