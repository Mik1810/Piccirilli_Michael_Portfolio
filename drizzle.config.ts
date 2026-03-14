import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

loadEnv({ path: '.env.local' })

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.SUPABASE_URL ||
  ''

if (!connectionString) {
  throw new Error('Missing DATABASE_URL, SUPABASE_DB_URL, or SUPABASE_URL for Drizzle config')
}

if (!/^postgres(ql)?:\/\//i.test(connectionString)) {
  throw new Error(
    'Drizzle requires a PostgreSQL connection string. SUPABASE_URL currently looks like an HTTP project URL, not a DB URL.'
  )
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
  verbose: true,
})
