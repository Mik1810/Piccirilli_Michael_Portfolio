import { getAdminEnvironmentSnapshot } from '../../config/env.js'
import { enforceMethod, respondWithError } from '../../http/apiUtils.js'
import { requireAdminSession } from '../../requireAdminSession.js'
import type { ApiHandler } from '../../types/http.js'

export const handleAdminEnvironmentRoute: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  const admin = requireAdminSession(req, res)
  if (!admin) return

  try {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      environmentVariables: getAdminEnvironmentSnapshot(),
    })
  } catch (error) {
    return respondWithError(res, error)
  }
}
