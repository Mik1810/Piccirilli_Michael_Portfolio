import { appEnv } from '../lib/config/env.js'
import { enforceMethod, parseBodyWithSchema, respondWithError } from '../lib/http/apiUtils.js'
import { contactBodySchema } from '../lib/http/requestSchemas.js'
import { enforceRateLimit } from '../lib/http/rateLimit.js'
import { sendContactMessage } from '../lib/services/contactService.js'
import type { ApiHandler } from '../lib/types/http.js'

const RATE_LIMIT = {
  keyPrefix: 'public-contact',
  limit: appEnv.isProduction ? 6 : 20,
  windowMs: 10 * 60 * 1000,
}

const handler: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'POST')) return

  try {
    enforceRateLimit(req, res, RATE_LIMIT)

    const payload = parseBodyWithSchema(req, contactBodySchema)

    await sendContactMessage({
      name: payload.name,
      email: payload.email,
      message: payload.message,
      locale: payload.locale,
    })

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      ok: true,
    })
  } catch (error) {
    return respondWithError(res, error)
  }
}

export default handler
