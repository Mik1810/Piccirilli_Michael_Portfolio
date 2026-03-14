import {
  fetchExperiences,
  type ExperiencesResponse,
} from '../lib/db/repositories/experiencesRepository.js'
import { normalizeRepositoryLocale } from '../lib/db/repositories/projectsRepository.js'
import type { ApiHandler } from '../lib/types/http.js'

const CACHE_TTL_MS = 60 * 1000

const cache = new Map<string, { at: number; value: ExperiencesResponse }>()

const handler: ApiHandler = async (req, res) => {
  const lang = normalizeRepositoryLocale(req.query?.lang)
  const cacheKey = `experiences:${lang}`

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(cached.value)
  }

  try {
    const payload = await fetchExperiences(lang)
    cache.set(cacheKey, { at: Date.now(), value: payload })

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(payload)
  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({
      error: 'Internal server error',
    })
  }
}

export default handler
