import type { TokenResponse } from '../api/authApi';

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
const TOKEN_TYPE_STORAGE_KEY = 'tokenType';
const ACCESS_TOKEN_EXPIRES_IN_STORAGE_KEY = 'accessTokenExpiresIn';

export function getAccessToken(): string {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? '';
}

export function getRefreshToken(): string {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? '';
}

export function saveTokens(tokens: TokenResponse): void {
  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error('로그인 응답에 필수 token이 없습니다.');
  }

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
  localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, tokens.tokenType || 'Bearer');
  localStorage.setItem(
    ACCESS_TOKEN_EXPIRES_IN_STORAGE_KEY,
    String(tokens.accessTokenExpiresIn),
  );
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRES_IN_STORAGE_KEY);
}
