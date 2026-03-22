import { MemoryCache } from '../../cache/memoryCache.js'
import type { ProfileResponse } from '../../db/repositories/profileRepository.js'
import {
  enforceMethod,
  parseQueryWithSchema,
  respondWithError,
} from '../../http/apiUtils.js'
import { localeQuerySchema } from '../../http/requestSchemas.js'
import { enforceRateLimit } from '../../http/rateLimit.js'
import { logApiError } from '../../logger.js'
import {
  getProfileContent,
  normalizeRepositoryLocale,
} from '../publicContentService.js'
import type { ApiHandler } from '../../types/http.js'

const CACHE_TTL_MS = 60 * 1000
const cache = new MemoryCache<ProfileResponse>()
const RATE_LIMIT = {
  keyPrefix: 'public-profile',
  limit: 180,
  windowMs: 60 * 1000,
}

export const handlePublicProfileRoute: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  let lang = normalizeRepositoryLocale(undefined)

  try {
    enforceRateLimit(req, res, RATE_LIMIT)

    const { lang: rawLang } = parseQueryWithSchema(req, localeQuerySchema)
    lang = normalizeRepositoryLocale(rawLang)
    const cacheKey = `profile:${lang}`
    const cached = cache.get(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
      return res.status(200).json(cached)
    }

    const payload = await getProfileContent(lang)
    cache.set(cacheKey, payload, CACHE_TTL_MS)
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(payload)
  } catch (error) {
    logApiError('profile', error, { lang, url: req.url })
    return respondWithError(res, error)
  }
}
