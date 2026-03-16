import { HttpError } from './apiUtils.js'
import type { ApiResponse, ApiRequest } from '../types/http.js'

interface RateLimitBucket {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  keyPrefix: string
  limit: number
  windowMs: number
}

class RateLimitError extends HttpError {
  resetAt: number
  retryAfterSeconds: number
  limit: number

  constructor(limit: number, resetAt: number, retryAfterSeconds: number) {
    super(429, 'Too many requests', { code: 'rate_limited' })
    this.limit = limit
    this.resetAt = resetAt
    this.retryAfterSeconds = retryAfterSeconds
  }
}

const buckets = new Map<string, RateLimitBucket>()

const getClientIp = (req: ApiRequest) => {
  if (typeof req.ip === 'string' && req.ip.trim()) {
    return req.ip.trim()
  }

  const forwardedFor = req.headers?.['x-forwarded-for']
  const candidate = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor
  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.split(',')[0]?.trim() || 'unknown'
  }

  const realIp = req.headers?.['x-real-ip']
  const fallback = Array.isArray(realIp) ? realIp[0] : realIp
  return typeof fallback === 'string' && fallback.trim() ? fallback.trim() : 'unknown'
}

const cleanupExpiredBuckets = (now: number) => {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

const setRateLimitHeaders = (
  res: ApiResponse,
  options: RateLimitOptions,
  bucket: RateLimitBucket
) => {
  const remaining = Math.max(options.limit - bucket.count, 0)
  res.setHeader('X-RateLimit-Limit', String(options.limit))
  res.setHeader('X-RateLimit-Remaining', String(remaining))
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)))
}

export const enforceRateLimit = (
  req: ApiRequest,
  res: ApiResponse,
  options: RateLimitOptions
) => {
  const now = Date.now()
  cleanupExpiredBuckets(now)

  const clientKey = `${options.keyPrefix}:${getClientIp(req)}`
  const current = buckets.get(clientKey)

  if (!current || current.resetAt <= now) {
    const bucket = {
      count: 1,
      resetAt: now + options.windowMs,
    }
    buckets.set(clientKey, bucket)
    setRateLimitHeaders(res, options, bucket)
    return
  }

  if (current.count >= options.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((current.resetAt - now) / 1000)
    )
    setRateLimitHeaders(res, options, current)
    res.setHeader('Retry-After', String(retryAfterSeconds))
    throw new RateLimitError(options.limit, current.resetAt, retryAfterSeconds)
  }

  current.count += 1
  setRateLimitHeaders(res, options, current)
}

