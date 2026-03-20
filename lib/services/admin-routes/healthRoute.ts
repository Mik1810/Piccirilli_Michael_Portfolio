import { enforceMethod, respondWithError } from '../../http/apiUtils.js'
import { requireAdminSession } from '../../requireAdminSession.js'
import {
  createAdminHealthPayload,
  runDatabaseHealthCheck,
} from '../healthService.js'
import type { ApiHandler } from '../../types/http.js'

export const handleAdminHealthRoute: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  const admin = requireAdminSession(req, res)
  if (!admin) return

  try {
    const database = await runDatabaseHealthCheck()
    const payload = createAdminHealthPayload(database)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(database.ok ? 200 : 503).json(payload)
  } catch (error) {
    return respondWithError(res, error)
  }
}
