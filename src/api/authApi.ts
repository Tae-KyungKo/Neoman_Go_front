import { requestApi } from './httpClient';

export interface LoginCredentials {
  loginId: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresIn: number;
}

export interface AvailabilityResponse {
  available: boolean;
}

export function requestLogin(credentials: LoginCredentials): Promise<TokenResponse> {
  return requestApi<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function checkLoginId(loginId: string): Promise<AvailabilityResponse> {
  return requestApi<AvailabilityResponse>(
    `/api/auth/check-login-id?loginId=${encodeURIComponent(loginId)}`,
  );
}

export function checkNickname(nickname: string): Promise<AvailabilityResponse> {
  return requestApi<AvailabilityResponse>(
    `/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`,
  );
}
