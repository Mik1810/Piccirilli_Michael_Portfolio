export const logApiError = (
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
) => {
  const details =
    error instanceof Error
      ? {
          message: error.message,
          stack: error.stack,
          cause:
            error.cause instanceof Error
              ? {
                  message: error.cause.message,
                  stack: error.cause.stack,
                  name: error.cause.name,
                }
              : error.cause,
        }
      : { error }

  console.error(`[api] ${context}`, {
    ...details,
    ...(metadata || {}),
  })
}

const parseBooleanFlag = (value: string | undefined) =>
  value === '1' || value === 'true' || value === 'yes'

const isTimingLoggingEnabled = (() => {
  const rawValue = process.env.DEV_API_DEBUG_LOGS
  if (typeof rawValue === 'string') {
    return parseBooleanFlag(rawValue.trim().toLowerCase())
  }

  return (process.env.NODE_ENV || 'development') !== 'production'
})()

export const logTiming = (
  context: string,
  metadata?: Record<string, unknown>
) => {
  if (!isTimingLoggingEnabled) return
  console.info(`[DEBUG] ${context}`, metadata || {})
}
