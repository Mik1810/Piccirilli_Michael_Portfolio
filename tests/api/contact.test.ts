import { describe, expect, it, vi } from 'vitest'

import { HttpError } from '../../lib/http/apiUtils.ts'
import { invokeApiHandler } from './testUtils.ts'
import { sendContactMessage } from '../../lib/services/contactService.ts'
import contactHandler from '../../api/contact.ts'

vi.mock('../../lib/services/contactService.ts', () => ({
  sendContactMessage: vi.fn(),
}))

describe('Contact API', () => {
  it('POST /api/contact accepts a valid payload and returns rate-limit headers', async () => {
    vi.mocked(sendContactMessage).mockResolvedValueOnce({ id: 'email_123' })

    const response = await invokeApiHandler(contactHandler, {
      method: 'POST',
      url: '/api/contact',
      ip: '127.0.2.10',
      body: {
        name: 'Mario Rossi',
        email: 'mario@example.com',
        message: 'Ciao Michael, vorrei parlare di un progetto web insieme.',
        locale: 'it',
        website: '',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ ok: true })
    expect(response.getHeader('cache-control')).toBe('no-store')
    expect(response.getHeader('x-ratelimit-limit')).toBeDefined()
    expect(response.getHeader('x-ratelimit-remaining')).toBeDefined()
    expect(response.getHeader('x-ratelimit-reset')).toBeDefined()
    expect(sendContactMessage).toHaveBeenCalledWith({
      name: 'Mario Rossi',
      email: 'mario@example.com',
      message: 'Ciao Michael, vorrei parlare di un progetto web insieme.',
      locale: 'it',
    })
  })

  it('rejects invalid contact payloads', async () => {
    const response = await invokeApiHandler(contactHandler, {
      method: 'POST',
      url: '/api/contact',
      ip: '127.0.2.11',
      body: {
        name: 'M',
        email: 'invalid-email',
        message: 'short',
        locale: 'it',
        website: '',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'invalid_body',
        error: expect.any(String),
      })
    )
  })

  it('rejects honeypot submissions', async () => {
    const response = await invokeApiHandler(contactHandler, {
      method: 'POST',
      url: '/api/contact',
      ip: '127.0.2.12',
      body: {
        name: 'Mario Rossi',
        email: 'mario@example.com',
        message: 'Ciao Michael, vorrei parlare di un progetto web insieme.',
        locale: 'it',
        website: 'https://spam.example',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'invalid_body',
      })
    )
  })

  it('surfaces contact delivery failures as provider errors', async () => {
    vi.mocked(sendContactMessage).mockRejectedValueOnce(
      new HttpError(502, 'Unable to deliver message right now', {
        code: 'contact_delivery_failed',
      })
    )

    const response = await invokeApiHandler(contactHandler, {
      method: 'POST',
      url: '/api/contact',
      ip: '127.0.2.13',
      body: {
        name: 'Mario Rossi',
        email: 'mario@example.com',
        message: 'Ciao Michael, vorrei parlare di un progetto web insieme.',
        locale: 'it',
        website: '',
      },
    })

    expect(response.statusCode).toBe(502)
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'contact_delivery_failed',
        error: 'Unable to deliver message right now',
      })
    )
  })
})
