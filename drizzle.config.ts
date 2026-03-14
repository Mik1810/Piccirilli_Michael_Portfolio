import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

loadEnv({ path: '.env.local' })

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  ''

if (!connectionString) {
  throw new Error(
    'Missing DATABASE_URL or SUPABASE_DB_URL for Drizzle config. Drizzle requires a PostgreSQL DSN and cannot use SUPABASE_URL, which is the HTTP project endpoint.'
  )
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
