import { sqlClient } from '../lib/db/client.js'
import { appEnv } from '../lib/config/env.js'
import { appMetadata, getDeploymentMetadata, getUptimeSeconds } from '../lib/appMetadata.js'
import { enforceMethod, respondWithError } from '../lib/http/apiUtils.js'
import { enforceRateLimit } from '../lib/http/rateLimit.js'
import type { ApiHandler } from '../lib/types/http.js'

const RATE_LIMIT = {
  keyPrefix: 'public-health',
  limit: 120,
  windowMs: 60 * 1000,
}

const handler: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  try {
    enforceRateLimit(req, res, RATE_LIMIT)

    const startedAt = Date.now()
    let databaseOk = false
    let databaseLatencyMs = null

    try {
      await sqlClient`select 1 as ok`
      databaseOk = true
      databaseLatencyMs = Date.now() - startedAt
    } catch {
      databaseOk = false
      databaseLatencyMs = null
    }

    const payload = {
      ok: databaseOk,
      service: 'api',
      timestamp: new Date().toISOString(),
      environment: appEnv.nodeEnv,
      app: {
        name: appMetadata.name,
        version: appMetadata.version,
        uptimeSeconds: getUptimeSeconds(),
        startedAt: appMetadata.startedAt.toISOString(),
      },
      deployment: getDeploymentMetadata(),
      checks: {
        database: {
          ok: databaseOk,
          latencyMs: databaseLatencyMs,
        },
      },
    }

    res.setHeader('Cache-Control', 'no-store')
    return res.status(databaseOk ? 200 : 503).json(payload)
  } catch (error) {
    return respondWithError(res, error)
  }
}

export default handler
