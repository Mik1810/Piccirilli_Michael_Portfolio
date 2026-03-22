import { MemoryCache } from '../../cache/memoryCache.js'
import type { ProjectsResponse } from '../../db/repositories/projectsRepository.js'
import {
  enforceMethod,
  parseQueryWithSchema,
  respondWithError,
} from '../../http/apiUtils.js'
import { localeQuerySchema } from '../../http/requestSchemas.js'
import { enforceRateLimit } from '../../http/rateLimit.js'
import { logApiError } from '../../logger.js'
import {
  getProjectsContent,
  normalizeRepositoryLocale,
} from '../publicContentService.js'
import type { ApiHandler } from '../../types/http.js'

const CACHE_TTL_MS = 60 * 1000
const cache = new MemoryCache<ProjectsResponse>()
const RATE_LIMIT = {
  keyPrefix: 'public-projects',
  limit: 180,
  windowMs: 60 * 1000,
}

export const handlePublicProjectsRoute: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  let lang = normalizeRepositoryLocale(undefined)

  try {
    enforceRateLimit(req, res, RATE_LIMIT)

    const { lang: rawLang } = parseQueryWithSchema(req, localeQuerySchema)
    lang = normalizeRepositoryLocale(rawLang)
    const cacheKey = `projects:${lang}`
    const cached = cache.get(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
      return res.status(200).json(cached)
    }

    const payload = await getProjectsContent(lang)
    const { projects, githubProjects } = payload

    if (
      (projects.length > 0 && projects.some((project) => project.title)) ||
      (githubProjects.length > 0 && githubProjects.some((project) => project.title))
    ) {
      cache.set(cacheKey, payload, CACHE_TTL_MS)
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(payload)
  } catch (error) {
    logApiError('projects', error, { lang, url: req.url })
    return respondWithError(res, error)
  }
}
