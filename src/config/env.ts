const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be configured for production builds');
}

export const API_BASE_URL = (configuredApiBaseUrl || 'http://localhost:8080').replace(/\/+$/, '');
