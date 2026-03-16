import type { SessionUser } from '../../types/auth.js'

import { getSupabaseAuthConfig } from '../../config/env.js'

interface SupabaseAuthResponse {
  user?: {
    id: string
    email?: string | null
  } | null
}

const hasAuthUser = (
  value: SupabaseAuthResponse | { error_description?: string; msg?: string; message?: string } | null
): value is SupabaseAuthResponse =>
  !!value && typeof value === 'object' && 'user' in value

export const signInAdmin = async (
  email: string,
  password: string
): Promise<SessionUser> => {
  const { supabaseUrl, supabaseSecretKey } = getSupabaseAuthConfig()

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseSecretKey,
      Authorization: `Bearer ${supabaseSecretKey}`,
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })

  const payload = (await response.json().catch(() => null)) as
    | SupabaseAuthResponse
    | { error_description?: string; msg?: string; message?: string }
    | null

  if (!response.ok) {
    const message =
      (payload &&
        'error_description' in payload &&
        payload.error_description) ||
      (payload && 'msg' in payload && payload.msg) ||
      (payload && 'message' in payload && payload.message) ||
      'Invalid login credentials'
    throw new Error(message)
  }

  const user: SessionUser | null = hasAuthUser(payload) && payload.user
    ? { id: payload.user.id, email: payload.user.email || '' }
    : null

  if (!user || !user.email) {
    throw new Error('Invalid user session')
  }

  return user
}
