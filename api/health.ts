import { enforceMethod, respondWithError } from '../lib/http/apiUtils.js'
import { enforceRateLimit } from '../lib/http/rateLimit.js'
import type { ApiHandler } from '../lib/types/http.js'

const RATE_LIMIT = {
  keyPrefix: 'public-health',
  limit: 120,
  windowMs: 60 * 1000,
}

const handler: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  try {
    enforceRateLimit(req, res, RATE_LIMIT)

    return res.status(200).json({
      ok: true,
      service: 'api',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return respondWithError(res, error)
  }
}

export default handler
