import { getAdminSessionResponse } from '../../lib/services/adminAuthService.js'
import { enforceMethod } from '../../lib/http/apiUtils.js'
import type { ApiHandler } from '../../lib/types/http.js'

const handler: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  const payload = getAdminSessionResponse(req)
  return res.status(200).json(payload)
}

export default handler
