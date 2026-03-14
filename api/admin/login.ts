import { loginAdmin } from '../../lib/services/adminAuthService.js'
import type { ApiHandler, ApiRequest } from '../../lib/types/http.js'

interface LoginBody {
  email?: string
  password?: string
}

const handler: ApiHandler<LoginBody> = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = (req as ApiRequest<LoginBody>).body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password obbligatorie' })
  }

  try {
    const { user, cookie } = await loginAdmin(email, password)
    res.setHeader('Set-Cookie', cookie)

    return res.status(200).json({
      user,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    if (message === 'Invalid user session') {
      return res.status(401).json({ error: message })
    }
    if (message && message !== 'Internal server error') {
      return res.status(401).json({ error: message })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default handler
