import { existsSync } from 'node:fs'

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const productionEnvUrl = new URL('./.env.production', import.meta.url)

  if (mode === 'production' && !existsSync(productionEnvUrl)) {
    throw new Error('.env.production is required for production builds')
  }

  const env = loadEnv(mode, '.', '')

  if (mode === 'production' && env.VITE_USE_MOCK_DATA !== 'true' && !env.VITE_API_BASE_URL?.trim()) {
    throw new Error('VITE_API_BASE_URL must be configured for production builds when mock data is disabled')
  }

  return {
    plugins: [react()],
  }
})
