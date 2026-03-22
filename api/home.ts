import { handlePublicAboutRoute } from '../lib/services/public-routes/aboutRoute.js'
import { handlePublicContactRoute } from '../lib/services/public-routes/contactRoute.js'
import { handlePublicExperiencesRoute } from '../lib/services/public-routes/experiencesRoute.js'
import { handlePublicHealthRoute } from '../lib/services/public-routes/healthRoute.js'
import { handlePublicProfileRoute } from '../lib/services/public-routes/profileRoute.js'
import { handlePublicProjectsRoute } from '../lib/services/public-routes/projectsRoute.js'
import { handlePublicSkillsRoute } from '../lib/services/public-routes/skillsRoute.js'
import type { ApiHandler, ApiRequest } from '../lib/types/http.js'

const REQUEST_URL_BASE = 'http://localhost'

const getPublicRoute = (req: ApiRequest) => {
  if (!req.url) return null

  try {
    const url = new URL(req.url, REQUEST_URL_BASE)
    const queryRoute = url.searchParams.get('route')
    if (queryRoute) return queryRoute

    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 2 || parts[0] !== 'api') return null
    if (parts[1] === 'admin') return null
    if (parts[1] === 'home' && parts.length > 2) return parts[2] ?? null
    return parts[1] ?? null
  } catch {
    return null
  }
}

const handler: ApiHandler = async (req, res) => {
  const route = getPublicRoute(req)

  switch (route) {
    case 'profile':
      return handlePublicProfileRoute(req, res)
    case 'about':
      return handlePublicAboutRoute(req, res)
    case 'projects':
      return handlePublicProjectsRoute(req, res)
    case 'skills':
      return handlePublicSkillsRoute(req, res)
    case 'experiences':
      return handlePublicExperiencesRoute(req, res)
    case 'health':
      return handlePublicHealthRoute(req, res)
    case 'contact':
      return handlePublicContactRoute(req, res)
    default:
      return res.status(404).json({
        error: 'Public route not found',
        code: 'not_found',
      })
  }
}

export default handler
