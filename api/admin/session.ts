import { getAdminSessionResponse } from '../../lib/services/adminAuthService.js'
import type { ApiHandler } from '../../lib/types/http.js'

const handler: ApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const payload = getAdminSessionResponse(req)
  return res.status(200).json(payload)
}

export default handler
