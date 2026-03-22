import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { appEnv, getDatabaseUrl } from '../config/env.js'
import * as schema from './schema.js'

const connectionString = getDatabaseUrl()

let client: postgres.Sql | null = null

const getClient = () => {
  if (!client) {
    client = postgres(connectionString, {
      // Vercel functions are short-lived and scale horizontally:
      // keep a small but non-trivial pool for Supavisor-backed traffic.
      max: appEnv.dbPoolMax,
      idle_timeout: 5,
      connect_timeout: 15,
      ssl: 'require',
      prepare: false,
      connection: {
        statement_timeout: appEnv.dbStatementTimeoutMs,
      },
    })
  }

  return client
}

export const sqlClient = getClient()
export const db = drizzle(sqlClient, { schema })
export { schema }
