import { config as loadEnv } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema.js'

loadEnv({ path: '.env.local' })

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.SUPABASE_URL ||
  ''

let client: postgres.Sql | null = null

const getClient = () => {
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL, SUPABASE_DB_URL, or SUPABASE_URL')
  }

  if (!/^postgres(ql)?:\/\//i.test(connectionString)) {
    throw new Error(
      'Drizzle requires a PostgreSQL connection string. SUPABASE_URL currently looks like an HTTP project URL, not a DB URL.'
    )
  }

  if (!client) {
    client = postgres(connectionString, {
      prepare: false,
    })
  }

  return client
}

export const db = drizzle(getClient(), { schema })
export { schema }
