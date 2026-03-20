import { enforceMethod } from '../../http/apiUtils.js'
import { requireAdminSession } from '../../requireAdminSession.js'
import { getAdminTablesList } from '../adminTableService.js'
import type { ApiHandler } from '../../types/http.js'

export const handleAdminTablesRoute: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  const admin = requireAdminSession(req, res)
  if (!admin) return

  const tables = getAdminTablesList()
  return res.status(200).json({ tables })
}
