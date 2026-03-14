import { config as loadEnv } from 'dotenv'
import type { SessionUser } from '../../types/auth.js'

loadEnv({ path: '.env.local' })
loadEnv()

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
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL')
  }

  if (!supabaseSecretKey) {
    throw new Error(
      'Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)'
    )
  }

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
