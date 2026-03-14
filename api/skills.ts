import {
  getSkillsContent,
  normalizeRepositoryLocale,
} from '../lib/services/publicContentService.js'
import type { SkillsResponse } from '../lib/db/repositories/skillsRepository.js'
import { enforceMethod, respondWithError } from '../lib/http/apiUtils.js'
import { logApiError } from '../lib/logger.js'
import type { ApiHandler } from '../lib/types/http.js'

const CACHE_TTL_MS = 60 * 1000

const cache = new Map<string, { at: number; value: SkillsResponse }>()

const handler: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  const lang = normalizeRepositoryLocale(req.query?.lang)
  const cacheKey = `skills:${lang}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(cached.value)
  }

  try {
    const payload = await getSkillsContent(lang)
    const { techStack, categories } = payload
    if (techStack.length > 0 || categories.length > 0) {
      cache.set(cacheKey, { at: Date.now(), value: payload })
    }
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(payload)
  } catch (error) {
    logApiError('skills', error, { lang, url: req.url })
    return respondWithError(res, error)
  }
}

export default handler
