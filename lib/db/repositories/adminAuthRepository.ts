import { supabaseAdmin } from '../../supabaseAdmin.js'
import type { SessionUser } from '../../types/auth.js'

export const signInAdmin = async (
  email: string,
  password: string
): Promise<SessionUser> => {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  const user: SessionUser | null = data?.user
    ? { id: data.user.id, email: data.user.email || '' }
    : null

  if (!user || !user.email) {
    throw new Error('Invalid user session')
  }

  return user
}
