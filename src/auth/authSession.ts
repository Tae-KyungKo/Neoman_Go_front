export interface AuthSessionTokens {
  accessToken: string;
  tokenType?: string;
  accessTokenExpiresIn: number;
}

export interface AuthSessionSnapshot {
  accessToken: string;
  tokenType: string;
  accessTokenExpiresAt: number | null;
  csrfToken: string;
}

type AuthSessionListener = (snapshot: AuthSessionSnapshot) => void;

const EMPTY_SESSION: AuthSessionSnapshot = {
  accessToken: '',
  tokenType: 'Bearer',
  accessTokenExpiresAt: null,
  csrfToken: '',
};

let currentSession: AuthSessionSnapshot = { ...EMPTY_SESSION };
const listeners = new Set<AuthSessionListener>();

export function getAuthSession(): AuthSessionSnapshot {
  return { ...currentSession };
}

export function setAuthSession(tokens: AuthSessionTokens): void {
  if (!tokens.accessToken) {
    throw new Error('인증 응답에 Access Token이 없습니다.');
  }
  if (!Number.isFinite(tokens.accessTokenExpiresIn) || tokens.accessTokenExpiresIn <= 0) {
    throw new Error('Access Token 만료 시간이 올바르지 않습니다.');
  }

  currentSession = {
    accessToken: tokens.accessToken,
    tokenType: tokens.tokenType || 'Bearer',
    accessTokenExpiresAt: Date.now() + tokens.accessTokenExpiresIn * 1000,
    csrfToken: currentSession.csrfToken,
  };
  notify();
}

export function clearAuthSession(): void {
  currentSession = {
    ...EMPTY_SESSION,
    csrfToken: currentSession.csrfToken,
  };
  notify();
}

export function setCsrfToken(csrfToken: string): void {
  if (!csrfToken) {
    throw new Error('CSRF Token이 없습니다.');
  }
  currentSession = {
    ...currentSession,
    csrfToken,
  };
  notify();
}

export function isAccessTokenExpired(clockSkewSeconds = 30): boolean {
  if (!currentSession.accessToken || currentSession.accessTokenExpiresAt === null) {
    return true;
  }
  return currentSession.accessTokenExpiresAt <= Date.now() + clockSkewSeconds * 1000;
}

export function subscribeAuthSession(listener: AuthSessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  const snapshot = getAuthSession();
  listeners.forEach((listener) => listener(snapshot));
}
