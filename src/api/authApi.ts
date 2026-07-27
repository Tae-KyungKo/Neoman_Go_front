import { requestApi, requestTokenReissue } from './httpClient';

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

export interface SignupPayload {
  loginId: string;
  password: string;
  passwordConfirm: string;
  email: string;
  nickname: string;
}

export interface SignupResponse {
  id: number;
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
  status: string;
}

export function requestLogin(credentials: LoginCredentials): Promise<TokenResponse> {
  return requestApi<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function requestReissue(refreshToken: string): Promise<TokenResponse> {
  return requestTokenReissue(refreshToken);
}

export function requestSignup(payload: SignupPayload): Promise<SignupResponse> {
  return requestApi<SignupResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function requestLogout(accessToken: string): Promise<void> {
  return requestApi<void>(
    '/api/auth/logout',
    { method: 'POST' },
    accessToken,
  );
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
