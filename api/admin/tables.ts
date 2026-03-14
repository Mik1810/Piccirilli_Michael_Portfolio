import { requireAdminSession } from '../../lib/requireAdminSession.js'
import { getAdminTablesList } from '../../lib/services/adminTableService.js'
import type { ApiHandler } from '../../lib/types/http.js'

const handler: ApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const admin = requireAdminSession(req, res)
  if (!admin) return

  const tables = getAdminTablesList()
  return res.status(200).json({ tables })
}

export default handler
