import type { ApiHandler, ApiHeaders, ApiRequest, ApiResponse } from '../../lib/types/http.js'

export type ApiInvocationOptions = Partial<ApiRequest>

export interface ApiInvocationResult {
  statusCode: number
  body: unknown
  headers: Record<string, string | number | readonly string[]>
  getHeader: (name: string) => string | number | readonly string[] | undefined
}

export const invokeApiHandler = async (
  handler: ApiHandler,
  options: ApiInvocationOptions = {}
): Promise<ApiInvocationResult> => {
  let statusCode = 200
  let body: unknown
  const headers: Record<string, string | number | readonly string[]> = {}

  const req: ApiRequest = {
    method: 'GET',
    headers: { host: 'localhost' } as ApiHeaders,
    ip: '127.0.0.1',
    url: '/',
    ...options,
  }

  const res: ApiResponse = {
    status(code: number) {
      statusCode = code
      return this
    },
    setHeader(name: string, value: string | number | readonly string[]) {
      headers[name.toLowerCase()] = value
      return this
    },
    json(payload: unknown) {
      body = payload
      return this
    },
    send(payload: unknown) {
      body = payload
      return this
    },
  }

  await handler(req, res)

  return {
    statusCode,
    body,
    headers,
    getHeader(name: string) {
      return headers[name.toLowerCase()]
    },
  }
}
