import {
  clearSessionCookie,
  createSessionCookie,
  createSessionToken,
  getSessionFromRequest,
} from '../authSession.js'
import { signInAdmin } from '../db/repositories/adminAuthRepository.js'
import type { AdminSessionResponse } from '../types/admin.js'
import type { SessionUser } from '../types/auth.js'
import type { ApiRequest } from '../types/http.js'

export const loginAdmin = async (
  email: string,
  password: string
): Promise<{ user: SessionUser; cookie: string }> => {
  const user = await signInAdmin(email, password)
  const token = createSessionToken(user)
  return {
    user,
    cookie: createSessionCookie(token),
  }
}

export const logoutAdmin = () => ({
  ok: true,
  cookie: clearSessionCookie(),
})

export const getAdminSessionResponse = (
  req: ApiRequest
): AdminSessionResponse => {
  const session = getSessionFromRequest(req)
  if (!session) {
    return { authenticated: false, user: null }
  }

  return {
    authenticated: true,
    user: { id: session.sub, email: session.email },
  }
}
