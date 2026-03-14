import {
  getExperiencesContent,
  normalizeRepositoryLocale,
} from '../lib/services/publicContentService.js'
import type { ExperiencesResponse } from '../lib/db/repositories/experiencesRepository.js'
import { enforceMethod, respondWithError } from '../lib/http/apiUtils.js'
import { logApiError } from '../lib/logger.js'
import type { ApiHandler } from '../lib/types/http.js'

const CACHE_TTL_MS = 60 * 1000

const cache = new Map<string, { at: number; value: ExperiencesResponse }>()

const handler: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  const lang = normalizeRepositoryLocale(req.query?.lang)
  const cacheKey = `experiences:${lang}`

  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(cached.value)
  }

  try {
    const payload = await getExperiencesContent(lang)
    cache.set(cacheKey, { at: Date.now(), value: payload })

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(payload)
  } catch (error) {
    logApiError('experiences', error, { lang, url: req.url })
    return respondWithError(res, error)
  }
}

export default handler
