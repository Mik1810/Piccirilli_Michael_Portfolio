import { ZodError, type ZodType } from 'zod'

import type { ApiMethod, ApiRequest, ApiResponse } from '../types/http.js'

const REQUEST_URL_BASE = 'http://localhost'

export class HttpError extends Error {
  statusCode: number
  expose: boolean
  code: string

  constructor(
    statusCode: number,
    message: string,
    options?: { expose?: boolean; code?: string }
  ) {
    super(message)
    this.statusCode = statusCode
    this.expose = options?.expose ?? true
    this.code = options?.code ?? 'internal_error'
  }
}

const formatZodError = (error: ZodError) =>
  error.issues.map((issue) => issue.message).join('; ') || 'Invalid request payload'

export const enforceMethod = (
  req: ApiRequest,
  res: ApiResponse,
  allowedMethod: ApiMethod
) => {
  if (req.method === allowedMethod) return true
  res.setHeader('Allow', allowedMethod)
  res.status(405).json({
    error: 'Method not allowed',
    code: 'method_not_allowed',
  })
  return false
}

export const enforceMethods = (
  req: ApiRequest,
  res: ApiResponse,
  allowedMethods: ApiMethod[]
) => {
  if (req.method && allowedMethods.includes(req.method as ApiMethod)) return true
  res.setHeader('Allow', allowedMethods.join(', '))
  res.status(405).json({
    error: 'Method not allowed',
    code: 'method_not_allowed',
  })
  return false
}

export const respondWithError = (
  res: ApiResponse,
  error: unknown,
  fallbackMessage = 'Internal server error'
) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    })
  }

  return res.status(500).json({
    error: fallbackMessage,
    code: 'internal_error',
  })
}

export const requireNonEmptyString = (
  value: unknown,
  errorMessage: string,
  options?: { trim?: boolean; maxLength?: number; code?: string }
) => {
  if (typeof value !== 'string') {
    throw new HttpError(400, errorMessage, { code: options?.code ?? 'invalid_request' })
  }

  const normalized = options?.trim === false ? value : value.trim()
  if (!normalized) {
    throw new HttpError(400, errorMessage, { code: options?.code ?? 'invalid_request' })
  }

  if (options?.maxLength && normalized.length > options.maxLength) {
    throw new HttpError(400, errorMessage, { code: options?.code ?? 'invalid_request' })
  }

  return normalized
}

export const requireRecord = (value: unknown, errorMessage: string) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, errorMessage, { code: 'invalid_request' })
  }

  return value as Record<string, unknown>
}

export const getQueryParam = (req: ApiRequest, key: string) => {
  if (!req.url) return undefined

  try {
    const url = new URL(req.url, REQUEST_URL_BASE)
    return url.searchParams.get(key) ?? undefined
  } catch {
    return undefined
  }
}

export const getQueryParams = (req: ApiRequest) => {
  if (!req.url) return {}

  try {
    const url = new URL(req.url, REQUEST_URL_BASE)
    return Object.fromEntries(url.searchParams.entries())
  } catch {
    return {}
  }
}

export const parseQueryWithSchema = <T>(
  req: ApiRequest,
  schema: ZodType<T>
): T => {
  const result = schema.safeParse(getQueryParams(req))

  if (!result.success) {
    throw new HttpError(400, formatZodError(result.error), {
      code: 'invalid_query',
    })
  }

  return result.data
}

export const parseBodyWithSchema = <T>(
  req: ApiRequest,
  schema: ZodType<T>
): T => {
  const result = schema.safeParse(req.body ?? {})

  if (!result.success) {
    throw new HttpError(400, formatZodError(result.error), {
      code: 'invalid_body',
    })
  }

  return result.data
}
