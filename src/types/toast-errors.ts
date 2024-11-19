export enum ToastErrorCode {
  SHADER_COMPILATION = 'SHADER_COMPILATION',
  WEBGL_CONTEXT_LOST = 'WEBGL_CONTEXT_LOST',
  ANIMATION_FAILURE = 'ANIMATION_FAILURE',
  GESTURE_FAILURE = 'GESTURE_FAILURE',
  SOUND_FAILURE = 'SOUND_FAILURE',
}

export class ToastError extends Error {
  constructor(
    message: string,
    public code: ToastErrorCode,
    public metadata?: Record<string, any>
  ) {
    super(message)
    this.name = 'ToastError'
  }
}
