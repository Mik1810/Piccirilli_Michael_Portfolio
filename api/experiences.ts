import {
  getExperiencesContent,
  normalizeRepositoryLocale,
} from '../lib/services/publicContentService.js'
import { MemoryCache } from '../lib/cache/memoryCache.js'
import type { ExperiencesResponse } from '../lib/db/repositories/experiencesRepository.js'
import {
  enforceMethod,
  parseQueryWithSchema,
  respondWithError,
} from '../lib/http/apiUtils.js'
import { localeQuerySchema } from '../lib/http/requestSchemas.js'
import { enforceRateLimit } from '../lib/http/rateLimit.js'
import { logApiError } from '../lib/logger.js'
import type { ApiHandler } from '../lib/types/http.js'

const CACHE_TTL_MS = 60 * 1000
const cache = new MemoryCache<ExperiencesResponse>()
const RATE_LIMIT = {
  keyPrefix: 'public-experiences',
  limit: 180,
  windowMs: 60 * 1000,
}

const handler: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  let lang = normalizeRepositoryLocale(undefined)

  try {
    enforceRateLimit(req, res, RATE_LIMIT)

    const { lang: rawLang } = parseQueryWithSchema(req, localeQuerySchema)
    lang = normalizeRepositoryLocale(rawLang)
    const cacheKey = `experiences:${lang}`

    const cached = cache.get(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
      return res.status(200).json(cached)
    }

    const payload = await getExperiencesContent(lang)
    cache.set(cacheKey, payload, CACHE_TTL_MS)

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(payload)
  } catch (error) {
    logApiError('experiences', error, { lang, url: req.url })
    return respondWithError(res, error)
  }
}

export default handler
