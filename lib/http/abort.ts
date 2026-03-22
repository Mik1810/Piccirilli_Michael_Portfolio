export class RequestAbortedError extends Error {
  constructor() {
    super('Request aborted')
    this.name = 'RequestAbortedError'
  }
}

export const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new RequestAbortedError()
  }
}

export const withAbortSignal = async <T>(
  promise: Promise<T>,
  signal?: AbortSignal
): Promise<T> => {
  if (!signal) return promise
  if (signal.aborted) throw new RequestAbortedError()

  let onAbort: (() => void) | null = null
  const abortPromise = new Promise<never>((_, reject) => {
    onAbort = () => reject(new RequestAbortedError())
    signal.addEventListener('abort', onAbort, { once: true })
  })

  try {
    return await Promise.race([promise, abortPromise])
  } finally {
    if (onAbort) {
      signal.removeEventListener('abort', onAbort)
    }
  }
}
