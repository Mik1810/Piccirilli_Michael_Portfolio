import { logoutAdmin } from '../../lib/services/adminAuthService.js'
import { enforceMethod } from '../../lib/http/apiUtils.js'
import { requireAdminSession } from '../../lib/requireAdminSession.js'
import type { ApiHandler } from '../../lib/types/http.js'

const handler: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'POST')) return

  const admin = requireAdminSession(req, res)
  if (!admin) return

  const result = logoutAdmin()
  res.setHeader('Set-Cookie', result.cookie)
  return res.status(200).json({ ok: result.ok })
}

export default handler
