import { enforceMethod } from '../lib/http/apiUtils.js'
import type { ApiHandler } from '../lib/types/http.js'

const handler: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  return res.status(200).json({
    ok: true,
    service: 'api',
    timestamp: new Date().toISOString(),
  })
}

export default handler
