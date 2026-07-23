export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (import.meta.env.PROD && !USE_MOCK_DATA && !configuredApiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be configured for production builds when mock data is disabled');
}

export const API_BASE_URL = (configuredApiBaseUrl || 'http://localhost:8080').replace(/\/+$/, '');
