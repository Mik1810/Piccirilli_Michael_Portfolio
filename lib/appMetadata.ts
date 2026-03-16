import { readFileSync } from 'node:fs'

const packageJsonPath = new URL('../package.json', import.meta.url)
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
  name?: string
  version?: string
}

const startedAt = new Date()

export const appMetadata = Object.freeze({
  name: packageJson.name || 'app',
  version: packageJson.version || '0.0.0',
  startedAt,
})

export const getDeploymentMetadata = () => ({
  commitSha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || null,
  branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || null,
})

export const getUptimeSeconds = () => Math.round((Date.now() - startedAt.getTime()) / 1000)
