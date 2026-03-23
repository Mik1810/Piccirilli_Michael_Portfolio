import { spawn } from 'node:child_process'

const apiPort = Number(process.env.API_PORT || 3000)
const apiReadyUrl = process.env.DEV_API_READY_URL || `http://localhost:${apiPort}/api/admin/session`
const waitTimeoutMs = Number(process.env.DEV_WEB_WAIT_TIMEOUT_MS || 120000)
const pollIntervalMs = Number(process.env.DEV_WEB_WAIT_INTERVAL_MS || 400)

const viteBin = process.platform === 'win32' ? 'vite.cmd' : 'vite'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForApiReady = async () => {
  const startedAt = Date.now()
  const deadline = startedAt + waitTimeoutMs

  console.log('[dev-web] waiting for API readiness', {
    url: apiReadyUrl,
    timeoutMs: waitTimeoutMs,
    intervalMs: pollIntervalMs,
  })

  while (Date.now() <= deadline) {
    try {
      const response = await fetch(apiReadyUrl, {
        method: 'GET',
        cache: 'no-store',
      })

      console.log('[dev-web] API ready', {
        url: apiReadyUrl,
        status: response.status,
        elapsedMs: Date.now() - startedAt,
      })
      return
    } catch {
      // API not ready yet, keep polling.
    }

    await delay(pollIntervalMs)
  }

  throw new Error(
    `Timed out while waiting for API readiness after ${waitTimeoutMs}ms (${apiReadyUrl})`
  )
}

const run = async () => {
  await waitForApiReady()

  const child = spawn(viteBin, [], {
    stdio: 'inherit',
    env: process.env,
  })

  const forwardSignal = (signal: NodeJS.Signals) => {
    if (!child.killed) {
      child.kill(signal)
    }
  }

  process.on('SIGINT', () => forwardSignal('SIGINT'))
  process.on('SIGTERM', () => forwardSignal('SIGTERM'))

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 0)
  })
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error('[dev-web] failed to start', { message })
  process.exit(1)
})
