const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be configured for production builds')
}

export function normalizeBaseUrl(value) {
  if (!value) {
    throw new Error('API base URL is required.')
  }

  return value.replace(/\/+$/, '')
}

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${API_BASE_URL}${normalizedPath}`
}

export const API_BASE_URL = normalizeBaseUrl(configuredApiBaseUrl || 'http://localhost:8080')
