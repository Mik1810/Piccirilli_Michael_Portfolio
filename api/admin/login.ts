import { loginAdmin } from '../../lib/services/adminAuthService.js'
import {
  HttpError,
  enforceMethod,
  parseBodyWithSchema,
  respondWithError,
} from '../../lib/http/apiUtils.js'
import { adminLoginBodySchema } from '../../lib/http/requestSchemas.js'
import { enforceRateLimit } from '../../lib/http/rateLimit.js'
import { logApiError } from '../../lib/logger.js'
import type { ApiHandler } from '../../lib/types/http.js'

interface LoginBody {
  email?: string
  password?: string
}

const handler: ApiHandler<LoginBody> = async (req, res) => {
  if (!enforceMethod(req, res, 'POST')) return

  try {
    enforceRateLimit(req, res, {
      keyPrefix: 'admin-login',
      limit: 5,
      windowMs: 60 * 1000,
    })

    const { email, password } = parseBodyWithSchema(req, adminLoginBodySchema)

    const { user, cookie } = await loginAdmin(email, password)
    res.setHeader('Set-Cookie', cookie)

    return res.status(200).json({
      user,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid user session') {
      return respondWithError(
        res,
        new HttpError(401, error.message, { code: 'invalid_user_session' })
      )
    }
    if (error instanceof HttpError) {
      return respondWithError(res, error)
    }
    if (error instanceof Error && error.message) {
      logApiError('admin.login', error, { url: req.url })
      return respondWithError(
        res,
        new HttpError(401, error.message, { code: 'auth_failed' })
      )
    }
    logApiError('admin.login', error, { url: req.url })
    return respondWithError(res, error)
  }
}

export default handler
