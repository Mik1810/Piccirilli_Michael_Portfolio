import { HttpError, respondWithError } from './http/apiUtils.js'
import { getSessionFromRequest } from './authSession.js'
import type { SessionUser } from './types/auth.js'
import type { ApiRequest, ApiResponse } from './types/http.js'

export function requireAdminSession(
  req: ApiRequest,
  res: ApiResponse
): SessionUser | null {
  const session = getSessionFromRequest(req)
  if (!session) {
    respondWithError(
      res,
      new HttpError(401, 'Unauthorized', { code: 'unauthorized' })
    )
    return null
  }
  return { id: session.sub, email: session.email }
}
