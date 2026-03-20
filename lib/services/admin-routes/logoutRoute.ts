import { enforceMethod } from '../../http/apiUtils.js'
import { requireAdminSession } from '../../requireAdminSession.js'
import { logoutAdmin } from '../adminAuthService.js'
import type { ApiHandler } from '../../types/http.js'

export const handleAdminLogoutRoute: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'POST')) return

  const admin = requireAdminSession(req, res)
  if (!admin) return

  const result = logoutAdmin()
  res.setHeader('Set-Cookie', result.cookie)
  return res.status(200).json({ ok: result.ok })
}
