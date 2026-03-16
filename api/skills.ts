import {
  getSkillsContent,
  normalizeRepositoryLocale,
} from '../lib/services/publicContentService.js'
import { MemoryCache } from '../lib/cache/memoryCache.js'
import type { SkillsResponse } from '../lib/db/repositories/skillsRepository.js'
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
const cache = new MemoryCache<SkillsResponse>()
const RATE_LIMIT = {
  keyPrefix: 'public-skills',
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
    const cacheKey = `skills:${lang}`
    const cached = cache.get(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
      return res.status(200).json(cached)
    }

    const payload = await getSkillsContent(lang)
    const { techStack, categories } = payload
    if (techStack.length > 0 || categories.length > 0) {
      cache.set(cacheKey, payload, CACHE_TTL_MS)
    }
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(payload)
  } catch (error) {
    logApiError('skills', error, { lang, url: req.url })
    return respondWithError(res, error)
  }
}

export default handler
