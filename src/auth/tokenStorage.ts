import type { TokenResponse } from '../api/authApi';
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from './authSession';

const LEGACY_TOKEN_STORAGE_KEYS = [
  'accessToken',
  'refreshToken',
  'tokenType',
  'accessTokenExpiresIn',
] as const;

removeLegacyStoredTokens();

export function getAccessToken(): string {
  return getAuthSession().accessToken;
}

export function getRefreshToken(): string {
  return getAuthSession().refreshToken;
}

export function saveTokens(tokens: TokenResponse): void {
  setAuthSession(tokens);
  removeLegacyStoredTokens();
}

export function clearTokens(): void {
  clearAuthSession();
  removeLegacyStoredTokens();
}

function removeLegacyStoredTokens(): void {
  if (typeof window === 'undefined') return;

  try {
    LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage may be blocked by browser privacy settings. The in-memory session remains authoritative.
  }
}
