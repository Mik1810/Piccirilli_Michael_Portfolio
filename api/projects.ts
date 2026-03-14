import {
  getProjectsContent,
  normalizeRepositoryLocale,
} from '../lib/services/publicContentService.js'
import type { ProjectsResponse } from '../lib/db/repositories/projectsRepository.js'
import { enforceMethod, respondWithError } from '../lib/http/apiUtils.js'
import { logApiError } from '../lib/logger.js'
import type { ApiHandler } from '../lib/types/http.js'

const CACHE_TTL_MS = 60 * 1000
const cache = new Map<string, { at: number; value: ProjectsResponse }>()

const handler: ApiHandler = async (req, res) => {
  if (!enforceMethod(req, res, 'GET')) return

  const lang = normalizeRepositoryLocale(req.query?.lang)
  const cacheKey = `projects:${lang}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(cached.value)
  }

  try {
    const payload = await getProjectsContent(lang)
    const { projects, githubProjects } = payload

    if (
      (projects.length > 0 && projects.some((project) => project.title)) ||
      (githubProjects.length > 0 &&
        githubProjects.some((project) => project.title))
    ) {
      cache.set(cacheKey, { at: Date.now(), value: payload })
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(payload)
  } catch (error) {
    logApiError('projects', error, { lang, url: req.url })
    return respondWithError(res, error)
  }
}

export default handler
