import { useCallback, useEffect, useState } from 'react'

import type { ProfileData, ProviderProps } from '../types/app.js'
import { ProfileContext } from './profileContextValue'
import { useLanguage } from './useLanguage'

const PROFILE_REQUEST_TIMEOUT_MS = 15000
const PROFILE_RETRY_DELAY_MS = 250
const PROFILE_QUICK_ABORT_THRESHOLD_MS = 1200

export function ProfileProvider({ children }: ProviderProps) {
  const { lang } = useLanguage()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const refreshProfile = useCallback(() => {
    setReloadKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const withTimeoutSignal = (timeoutMs: number) => {
      const timeoutController = new AbortController()
      const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs)
      const abortFromParent = () => timeoutController.abort()
      controller.signal.addEventListener('abort', abortFromParent)

      return {
        signal: timeoutController.signal,
        cleanup: () => {
          clearTimeout(timeoutId)
          controller.signal.removeEventListener('abort', abortFromParent)
        },
      }
    }

    const loadProfile = async () => {
      setLoading(true)
      try {
        const runOnce = async () => {
          const startedAt = performance.now()
          const timeout = withTimeoutSignal(PROFILE_REQUEST_TIMEOUT_MS)
          try {
            const response = await fetch(`/api/profile?lang=${lang}`, {
              signal: timeout.signal,
              cache: 'no-store',
            })
            const data = (await response.json()) as ProfileData
            return {
              ok: response.ok,
              data: response.ok ? data : null,
              aborted: false,
              elapsedMs: performance.now() - startedAt,
            }
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              if (controller.signal.aborted) throw error
              return {
                ok: false,
                data: null,
                aborted: true,
                elapsedMs: performance.now() - startedAt,
              }
            }
            return {
              ok: false,
              data: null,
              aborted: false,
              elapsedMs: performance.now() - startedAt,
            }
          } finally {
            timeout.cleanup()
          }
        }

        let attempt = await runOnce()
        const shouldRetryQuickAbort =
          attempt.aborted &&
          (attempt.elapsedMs ?? PROFILE_REQUEST_TIMEOUT_MS) <
            PROFILE_QUICK_ABORT_THRESHOLD_MS

        if (
          !attempt.ok &&
          (!attempt.aborted || shouldRetryQuickAbort) &&
          !controller.signal.aborted
        ) {
          await new Promise((resolve) => setTimeout(resolve, PROFILE_RETRY_DELAY_MS))
          if (!controller.signal.aborted) {
            attempt = await runOnce()
          }
        }

        if (!controller.signal.aborted && attempt.ok && attempt.data) {
          setProfile(attempt.data)
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          // Keep previous profile snapshot on transient failures.
        }
      }
      setLoading(false)
    }

    void loadProfile()
    return () => controller.abort()
  }, [lang, reloadKey])

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}
