import { enforceMethod } from '../../http/apiUtils.js'
import { getAdminSessionResponse } from '../adminAuthService.js'
import type { ApiHandler } from '../../types/http.js'

export const handleAdminSessionRoute: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return
  const payload = getAdminSessionResponse(req)
  return res.status(200).json(payload)
}
