import { defineConfig } from 'drizzle-kit'

import { getDatabaseUrl } from './lib/config/env.js'

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
  strict: true,
  verbose: true,
})
