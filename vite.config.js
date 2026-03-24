import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isAdminAssetName = (name = '') => /admin/i.test(name)
const getManualChunk = (id = '') => {
  if (!id.includes('node_modules')) return undefined

  if (
    id.includes('/react/') ||
    id.includes('/react-dom/') ||
    id.includes('/scheduler/')
  ) {
    return 'vendor-react'
  }

  if (id.includes('/react-router-dom/') || id.includes('/react-router/')) {
    return 'vendor-router'
  }

  if (
    id.includes('/recharts/') ||
    id.includes('/d3-') ||
    id.includes('/internmap/') ||
    id.includes('/robust-predicates/')
  ) {
    return 'vendor-charts'
  }

  if (id.includes('/zod/') || id.includes('/clsx/')) {
    return 'vendor-utils'
  }

  return 'vendor'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: getManualChunk,
        chunkFileNames: (chunkInfo) =>
          isAdminAssetName(chunkInfo.name)
            ? 'assets/admin-[hash].js'
            : 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const assetName = assetInfo.names?.[0] || assetInfo.name || ''

          if (
            assetName.toLowerCase().endsWith('.css') &&
            isAdminAssetName(assetName)
          ) {
            return 'assets/admin-[hash][extname]'
          }

          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  server: {
    port: 5173,
    watch: {
      usePolling: true,
      interval: 150,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
