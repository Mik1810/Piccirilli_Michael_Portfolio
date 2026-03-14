export const logApiError = (
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
) => {
  const details =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error }

  console.error(`[api] ${context}`, {
    ...details,
    ...(metadata || {}),
  })
}
