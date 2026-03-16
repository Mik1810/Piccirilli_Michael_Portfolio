import { config as loadEnv } from 'dotenv'
import { z } from 'zod'

loadEnv({ path: '.env.local', quiet: true })
loadEnv({ quiet: true })

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  API_PORT: z.coerce.number().int().positive().max(65535).optional(),
  AUTH_SESSION_SECRET: z.string().trim().min(1).optional(),
  DATABASE_URL: z.string().trim().min(1).optional(),
  SUPABASE_DB_URL: z.string().trim().min(1).optional(),
  SUPABASE_URL: z.string().trim().url().optional(),
  SUPABASE_SECRET_KEY: z.string().trim().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1).optional(),
})

const env = envSchema.parse(process.env)

export const appEnv = Object.freeze({
  nodeEnv: env.NODE_ENV ?? 'development',
  isProduction: (env.NODE_ENV ?? 'development') === 'production',
  apiPort: env.API_PORT ?? 3000,
})

export const getDatabaseUrl = () => {
  const connectionString = env.DATABASE_URL || env.SUPABASE_DB_URL

  if (!connectionString) {
    throw new Error(
      'Missing DATABASE_URL or SUPABASE_DB_URL. Drizzle requires a PostgreSQL DSN and cannot use SUPABASE_URL, which is the HTTP project endpoint.'
    )
  }

  if (!/^postgres(ql)?:\/\//i.test(connectionString)) {
    throw new Error(
      'Invalid database connection string. Expected a PostgreSQL DSN in DATABASE_URL or SUPABASE_DB_URL.'
    )
  }

  return connectionString
}

export const getSupabaseAuthConfig = () => {
  if (!env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL')
  }

  const supabaseSecretKey =
    env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseSecretKey) {
    throw new Error(
      'Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)'
    )
  }

  return {
    supabaseUrl: env.SUPABASE_URL,
    supabaseSecretKey,
  }
}

export const getAuthSessionSecret = () => {
  if (env.AUTH_SESSION_SECRET) {
    return env.AUTH_SESSION_SECRET
  }

  if (appEnv.isProduction) {
    throw new Error('Missing AUTH_SESSION_SECRET')
  }

  return 'dev-only-insecure-secret-change-me'
}
