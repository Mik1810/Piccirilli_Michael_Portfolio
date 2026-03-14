import { config as loadEnv } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema.js'

loadEnv({ path: '.env.local' })

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  ''

let client: postgres.Sql | null = null

const getClient = () => {
  if (!connectionString) {
    throw new Error(
      'Missing DATABASE_URL or SUPABASE_DB_URL. Drizzle requires a PostgreSQL DSN and cannot use SUPABASE_URL, which is the HTTP project endpoint.'
    )
  }

  if (!client) {
    client = postgres(connectionString, {
      // Vercel functions are short-lived and scale horizontally:
      // keep the local pool minimal and disable prepared statements for Supavisor.
      max: 1,
      idle_timeout: 5,
      connect_timeout: 15,
      prepare: false,
    })
  }

  return client
}

export const sqlClient = getClient()
export const db = drizzle(sqlClient, { schema })
export { schema }
