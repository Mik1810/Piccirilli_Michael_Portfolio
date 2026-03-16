import { afterEach, describe, expect, it, vi } from 'vitest'

import aboutHandler from '../../api/about.ts'
import experiencesHandler from '../../api/experiences.ts'
import profileHandler from '../../api/profile.ts'
import projectsHandler from '../../api/projects.ts'
import skillsHandler from '../../api/skills.ts'
import { invokeApiHandler } from './testUtils.ts'

const assertRateLimitHeaders = (headers: { getHeader: (name: string) => unknown }) => {
  expect(headers.getHeader('x-ratelimit-limit')).toBeDefined()
  expect(headers.getHeader('x-ratelimit-remaining')).toBeDefined()
  expect(headers.getHeader('x-ratelimit-reset')).toBeDefined()
}

const silenceConsoleError = () => vi.spyOn(console, 'error').mockImplementation(() => {})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DB-backed public endpoints', () => {
  it('returns stable payloads and rate-limit headers', async () => {
    const profileResponse = await invokeApiHandler(profileHandler, {
      url: '/api/profile?lang=it',
      ip: '127.0.0.11',
    })

    expect(profileResponse.statusCode).toBe(200)
    assertRateLimitHeaders(profileResponse)
    expect(profileResponse.getHeader('cache-control')).toBe('s-maxage=60, stale-while-revalidate=300')
    expect(profileResponse.body).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        greeting: expect.any(String),
        roles: expect.any(Array),
        socials: expect.any(Array),
      })
    )

    const aboutResponse = await invokeApiHandler(aboutHandler, {
      url: '/api/about?lang=en',
      ip: '127.0.0.12',
    })

    expect(aboutResponse.statusCode).toBe(200)
    assertRateLimitHeaders(aboutResponse)
    expect(aboutResponse.body).toEqual(
      expect.objectContaining({ interests: expect.any(Array) })
    )

    const projectsResponse = await invokeApiHandler(projectsHandler, {
      url: '/api/projects?lang=it',
      ip: '127.0.0.13',
    })

    expect(projectsResponse.statusCode).toBe(200)
    assertRateLimitHeaders(projectsResponse)
    expect(projectsResponse.body).toEqual(
      expect.objectContaining({
        projects: expect.any(Array),
        githubProjects: expect.any(Array),
      })
    )

    const skillsResponse = await invokeApiHandler(skillsHandler, {
      url: '/api/skills?lang=it',
      ip: '127.0.0.14',
    })

    expect(skillsResponse.statusCode).toBe(200)
    assertRateLimitHeaders(skillsResponse)
    expect(skillsResponse.body).toEqual(
      expect.objectContaining({
        techStack: expect.any(Array),
        categories: expect.any(Array),
      })
    )

    const experiencesResponse = await invokeApiHandler(experiencesHandler, {
      url: '/api/experiences?lang=it',
      ip: '127.0.0.15',
    })

    expect(experiencesResponse.statusCode).toBe(200)
    assertRateLimitHeaders(experiencesResponse)
    expect(experiencesResponse.body).toEqual(
      expect.objectContaining({
        experiences: expect.any(Array),
        education: expect.any(Array),
      })
    )
  })

  it('rejects invalid locale instead of silently normalizing it', async () => {
    const endpoints = [
      ['profile', profileHandler, '127.0.1.11'],
      ['about', aboutHandler, '127.0.1.12'],
      ['projects', projectsHandler, '127.0.1.13'],
      ['skills', skillsHandler, '127.0.1.14'],
      ['experiences', experiencesHandler, '127.0.1.15'],
    ] as const

    const consoleErrorSpy = silenceConsoleError()

    for (const [name, handler, ip] of endpoints) {
      const response = await invokeApiHandler(handler, {
        url: '/api/' + name + '?lang=fr',
        ip,
      })

      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual(
        expect.objectContaining({
          code: 'invalid_query',
          error: expect.any(String),
        })
      )
    }

    expect(consoleErrorSpy).toHaveBeenCalledTimes(endpoints.length)
  })
})
