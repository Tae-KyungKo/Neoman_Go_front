import { existsSync, readFileSync } from 'node:fs'

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const productionEnvUrl = new URL('./.env.production', import.meta.url)

  if (mode === 'production' && !existsSync(productionEnvUrl)) {
    throw new Error('.env.production is required for production builds')
  }

  if (mode === 'production') {
    const productionEnv = readFileSync(productionEnvUrl, 'utf8')
    const apiBaseUrl = productionEnv.match(/^\s*VITE_API_BASE_URL\s*=\s*(.+)\s*$/m)?.[1]

    if (!apiBaseUrl?.trim()) {
      throw new Error('VITE_API_BASE_URL must be set in .env.production')
    }
  }

  const env = loadEnv(mode, '.', '')

  if (mode === 'production' && !env.VITE_API_BASE_URL?.trim()) {
    throw new Error('VITE_API_BASE_URL must be configured for production builds')
  }

  return {
    plugins: [react()],
  }
})
