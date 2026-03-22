import { afterEach, describe, expect, it, vi } from 'vitest'

import publicHandler from '../../api/home.ts'
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
  it('GET /api/profile returns a stable payload and rate-limit headers', async () => {
    const response = await invokeApiHandler(publicHandler, {
      url: '/api/profile?lang=it',
      ip: '127.0.0.11',
    })

    expect(response.statusCode).toBe(200)
    assertRateLimitHeaders(response)
    expect(response.getHeader('cache-control')).toBe('s-maxage=60, stale-while-revalidate=300')
    expect(response.body).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        greeting: expect.any(String),
        roles: expect.any(Array),
        socials: expect.any(Array),
      })
    )
  })

  it('GET /api/about returns a stable payload and rate-limit headers', async () => {
    const response = await invokeApiHandler(publicHandler, {
      url: '/api/about?lang=en',
      ip: '127.0.0.12',
    })

    expect(response.statusCode).toBe(200)
    assertRateLimitHeaders(response)
    expect(response.body).toEqual(
      expect.objectContaining({ interests: expect.any(Array) })
    )
  })

  it('GET /api/projects returns a stable payload and rate-limit headers', async () => {
    const response = await invokeApiHandler(publicHandler, {
      url: '/api/projects?lang=it',
      ip: '127.0.0.13',
    })

    expect(response.statusCode).toBe(200)
    assertRateLimitHeaders(response)
    expect(response.body).toEqual(
      expect.objectContaining({
        projects: expect.any(Array),
        githubProjects: expect.any(Array),
      })
    )
  })

  it('GET /api/skills returns a stable payload and rate-limit headers', async () => {
    const response = await invokeApiHandler(publicHandler, {
      url: '/api/skills?lang=it',
      ip: '127.0.0.14',
    })

    expect(response.statusCode).toBe(200)
    assertRateLimitHeaders(response)
    expect(response.body).toEqual(
      expect.objectContaining({
        techStack: expect.any(Array),
        categories: expect.any(Array),
      })
    )
  })

  it('GET /api/experiences returns a stable payload and rate-limit headers', async () => {
    const response = await invokeApiHandler(publicHandler, {
      url: '/api/experiences?lang=it',
      ip: '127.0.0.15',
    })

    expect(response.statusCode).toBe(200)
    assertRateLimitHeaders(response)
    expect(response.body).toEqual(
      expect.objectContaining({
        experiences: expect.any(Array),
        education: expect.any(Array),
      })
    )
  })

  it('rejects invalid locale instead of silently normalizing it', async () => {
    const endpoints = [
      ['profile', '127.0.1.11'],
      ['about', '127.0.1.12'],
      ['projects', '127.0.1.13'],
      ['skills', '127.0.1.14'],
      ['experiences', '127.0.1.15'],
    ] as const

    const consoleErrorSpy = silenceConsoleError()

    for (const [name, ip] of endpoints) {
      const response = await invokeApiHandler(publicHandler, {
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
